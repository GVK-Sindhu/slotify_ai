using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Enums;
using SlotifyAi.Domain.Interfaces;

namespace SlotifyAi.Application.Services;

public class BookingService : IBookingService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public BookingService(IUnitOfWork unitOfWork, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<IEnumerable<BookingDto>> GetBookingsAsync()
    {
        var bookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();
        return bookings.Select(MapToDto);
    }

    public async Task<BookingDto?> GetBookingByIdAsync(Guid id)
    {
        var bookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();
        var booking = bookings.FirstOrDefault(b => b.Id == id);
        if (booking == null) return null;
        return MapToDto(booking);
    }

    public async Task<BookingDto?> GetBookingByReferenceAsync(string referenceNumber)
    {
        var booking = await _unitOfWork.Bookings.GetBookingByReferenceAsync(referenceNumber);
        if (booking == null) return null;
        return MapToDto(booking);
    }

    public async Task<BookingDto> CreateBookingAsync(CreateBookingRequest request)
    {
        var slot = await _unitOfWork.Slots.GetByIdAsync(request.SlotId);
        if (slot == null)
        {
            throw new ArgumentException("Selected slot does not exist.");
        }

        var offer = await _unitOfWork.Offers.GetByIdAsync(slot.OfferId);
        if (offer == null || offer.IsDeleted || offer.Status != OfferStatus.Active)
        {
            throw new InvalidOperationException("This offer is currently inactive or deleted.");
        }

        if (offer.EndDate.Date < DateTime.UtcNow.Date)
        {
            throw new InvalidOperationException("This offer has expired.");
        }

        if (request.PeopleCount > offer.MaxBookingPerCustomer)
        {
            throw new InvalidOperationException($"You can book a maximum of {offer.MaxBookingPerCustomer} seats per booking.");
        }

        var business = await _unitOfWork.Businesses.GetByIdAsync(offer.BusinessId);
        if (business == null)
        {
            throw new InvalidOperationException("Business profile not found.");
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            SlotId = request.SlotId,
            CustomerName = request.CustomerName,
            PhoneNumber = request.PhoneNumber,
            Email = request.Email,
            PeopleCount = request.PeopleCount,
            SpecialNote = request.SpecialNote,
            CouponCode = request.CouponCode,
            PaymentStatus = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        bool waitlisted = false;

        // Verify slot capacity
        if (slot.Status == SlotStatus.Full || slot.Status == SlotStatus.Closed || slot.AvailableCount < request.PeopleCount)
        {
            // Enter waitlist
            booking.JoinedWaitlist = true;
            booking.Status = BookingStatus.Pending;
            booking.ReferenceNumber = $"WLT-{new Random().Next(10000, 99999)}";
            waitlisted = true;
        }
        else
        {
            // Confirmed booking
            booking.JoinedWaitlist = false;
            booking.Status = BookingStatus.Confirmed;
            booking.ReferenceNumber = $"SLT-{new Random().Next(10000, 99999)}";

            slot.BookedCount += request.PeopleCount;
            if (slot.AvailableCount <= 0)
            {
                slot.Status = SlotStatus.Full;
            }
            _unitOfWork.Slots.Update(slot);
        }

        // Apply coupon verification if provided
        if (!string.IsNullOrEmpty(request.CouponCode))
        {
            var coupon = await _unitOfWork.Coupons.GetByIdAsync(Guid.Empty); // Dummy query, check exact code
            var couponData = await _unitOfWork.Coupons.FindAsync(c => c.Code.ToLower() == request.CouponCode.ToLower() && c.IsActive);
            var activeCoupon = couponData.FirstOrDefault();

            if (activeCoupon != null)
            {
                booking.CouponCode = activeCoupon.Code;
            }
            else
            {
                booking.CouponCode = null; // Ignore invalid coupons
            }
        }

        await _unitOfWork.Bookings.AddAsync(booking);
        await _unitOfWork.CompleteAsync();

        // Dispatch notifications asynchronously
        if (waitlisted)
        {
            await _notificationService.SendWaitlistNotificationAsync(booking, slot, offer, business);
        }
        else
        {
            await _notificationService.SendBookingConfirmationAsync(booking, slot, offer, business);
        }

        // Return DTO with flattened labels
        var dto = MapToDto(booking);
        dto.OfferTitle = offer.Title;
        dto.SlotDateLabel = slot.SlotDate.ToString("yyyy-MM-dd");
        dto.SlotTimeLabel = $"{slot.StartTime:hh\\:mm} - {slot.EndTime:hh\\:mm}";

        return dto;
    }

    public async Task<BookingDto?> UpdateBookingStatusAsync(Guid id, BookingStatus status)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null) return null;

        var prevStatus = booking.Status;
        booking.Status = status;
        booking.UpdatedAt = DateTime.UtcNow;

        var slot = await _unitOfWork.Slots.GetByIdAsync(booking.SlotId);
        if (slot != null)
        {
            bool wasHoldingSeat = prevStatus == BookingStatus.Confirmed || (prevStatus == BookingStatus.Pending && !booking.JoinedWaitlist);
            bool nowHoldingSeat = status == BookingStatus.Confirmed || (status == BookingStatus.Pending && !booking.JoinedWaitlist);

            if (wasHoldingSeat && !nowHoldingSeat)
            {
                // Release seats
                slot.BookedCount = Math.Max(0, slot.BookedCount - booking.PeopleCount);
                if (slot.Status == SlotStatus.Full && slot.AvailableCount > 0)
                {
                    slot.Status = SlotStatus.Available;
                }
                _unitOfWork.Slots.Update(slot);
                await _unitOfWork.CompleteAsync();

                // Process Waitlist: try to promote waitlisted bookings
                var waitlistItems = await _unitOfWork.Bookings.GetWaitlistedBookingsForSlotAsync(slot.Id);
                foreach (var wlBooking in waitlistItems.OrderBy(w => w.CreatedAt))
                {
                    if (slot.AvailableCount >= wlBooking.PeopleCount)
                    {
                        wlBooking.JoinedWaitlist = false;
                        wlBooking.Status = BookingStatus.Confirmed;
                        wlBooking.UpdatedAt = DateTime.UtcNow;
                        
                        slot.BookedCount += wlBooking.PeopleCount;
                        if (slot.AvailableCount <= 0)
                        {
                            slot.Status = SlotStatus.Full;
                        }

                        _unitOfWork.Bookings.Update(wlBooking);
                        _unitOfWork.Slots.Update(slot);
                        await _unitOfWork.CompleteAsync();

                        // Notify waitlist promotion
                        var offer = await _unitOfWork.Offers.GetByIdAsync(slot.OfferId);
                        var biz = offer != null ? await _unitOfWork.Businesses.GetByIdAsync(offer.BusinessId) : null;
                        if (offer != null && biz != null)
                        {
                            await _notificationService.SendPromotionNotificationAsync(wlBooking, slot, offer, biz);
                        }
                    }
                }
            }
            else if (!wasHoldingSeat && nowHoldingSeat)
            {
                // Check if capacity permits
                if (slot.AvailableCount < booking.PeopleCount)
                {
                    throw new InvalidOperationException("Cannot confirm booking; slot is already full.");
                }

                slot.BookedCount += booking.PeopleCount;
                if (slot.AvailableCount <= 0)
                {
                    slot.Status = SlotStatus.Full;
                }
                _unitOfWork.Slots.Update(slot);
            }
        }

        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        // Reload from DB to retrieve populated labels
        var enrichedBookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();
        var enriched = enrichedBookings.FirstOrDefault(b => b.Id == id);
        return enriched != null ? MapToDto(enriched) : MapToDto(booking);
    }

    public async Task<BookingDto?> UpdateBookingPaymentStatusAsync(Guid id, PaymentStatus status)
    {
        var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
        if (booking == null) return null;

        booking.PaymentStatus = status;
        booking.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Bookings.Update(booking);
        await _unitOfWork.CompleteAsync();

        var enrichedBookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();
        var enriched = enrichedBookings.FirstOrDefault(b => b.Id == id);
        return enriched != null ? MapToDto(enriched) : MapToDto(booking);
    }

    private static BookingDto MapToDto(Booking booking)
    {
        return new BookingDto
        {
            Id = booking.Id,
            SlotId = booking.SlotId,
            ReferenceNumber = booking.ReferenceNumber,
            CustomerName = booking.CustomerName,
            PhoneNumber = booking.PhoneNumber,
            Email = booking.Email,
            PeopleCount = booking.PeopleCount,
            SpecialNote = booking.SpecialNote,
            Status = booking.Status.ToString(),
            PaymentStatus = booking.PaymentStatus.ToString(),
            CouponCode = booking.CouponCode,
            JoinedWaitlist = booking.JoinedWaitlist,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt,
            OfferTitle = booking.Slot?.Offer?.Title ?? string.Empty,
            SlotDateLabel = booking.Slot?.SlotDate.ToString("yyyy-MM-dd") ?? string.Empty,
            SlotTimeLabel = booking.Slot != null 
                ? $"{booking.Slot.StartTime:hh\\:mm} - {booking.Slot.EndTime:hh\\:mm}" 
                : string.Empty
        };
    }
}
