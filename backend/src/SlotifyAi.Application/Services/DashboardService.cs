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

public class DashboardService : IDashboardService
{
    private readonly IUnitOfWork _unitOfWork;

    public DashboardService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid businessId)
    {
        var offers = await _unitOfWork.Offers.FindAsync(o => o.BusinessId == businessId && !o.IsDeleted);
        var slots = await _unitOfWork.Slots.GetAllAsync();
        var bookings = await _unitOfWork.Bookings.GetBookingsWithDetailsAsync();

        var businessOffers = offers.ToList();
        var businessOfferIds = businessOffers.Select(o => o.Id).ToList();

        // Filter slots and bookings belonging to this business
        var businessSlots = slots.Where(s => businessOfferIds.Contains(s.OfferId)).ToList();
        var businessSlotIds = businessSlots.Select(s => s.Id).ToList();
        var businessBookings = bookings.Where(b => businessSlotIds.Contains(b.SlotId)).ToList();

        int totalOffers = businessOffers.Count;
        int activeOffers = businessOffers.Count(o => o.Status == OfferStatus.Active);
        int totalBookings = businessBookings.Count;

        // Today's bookings
        var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");
        int todaysBookings = businessBookings.Count(b => b.CreatedAt.ToString("yyyy-MM-dd") == todayStr);

        int totalCapacity = 0;
        int bookedSeats = 0;
        foreach (var slot in businessSlots)
        {
            totalCapacity += slot.Capacity;
            bookedSeats += slot.BookedCount;
        }
        int availableSeats = Math.Max(0, totalCapacity - bookedSeats);

        // Conversion Rate
        int confirmedCount = businessBookings.Count(b => b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Completed);
        double conversionRate = totalBookings > 0 ? Math.Round(((double)confirmedCount / totalBookings) * 100, 2) : 0;

        // Revenue Calculation
        decimal totalRevenue = 0;
        var coupons = await _unitOfWork.Coupons.GetAllAsync();
        var couponList = coupons.ToList();

        foreach (var booking in businessBookings.Where(b => b.Status != BookingStatus.Cancelled && !b.JoinedWaitlist))
        {
            var slot = businessSlots.FirstOrDefault(s => s.Id == booking.SlotId);
            var offer = slot != null ? businessOffers.FirstOrDefault(o => o.Id == slot.OfferId) : null;
            if (offer != null)
            {
                decimal price = offer.OfferPrice;
                if (!string.IsNullOrEmpty(booking.CouponCode))
                {
                    var coupon = couponList.FirstOrDefault(c => c.Code.ToLower() == booking.CouponCode.ToLower());
                    if (coupon != null)
                    {
                        if (coupon.DiscountType == "Percentage")
                        {
                            price = price * (1 - (coupon.Value / 100));
                        }
                        else
                        {
                            price = Math.Max(0, price - (coupon.Value / booking.PeopleCount));
                        }
                    }
                }
                totalRevenue += price * booking.PeopleCount;
            }
        }

        // Trends (Last 7 Days)
        var bookingTrends = new List<BookingTrendPointDto>();
        var revenueTrends = new List<RevenueTrendPointDto>();

        for (int i = 6; i >= 0; i--)
        {
            var date = DateTime.UtcNow.AddDays(-i);
            var dateStr = date.ToString("yyyy-MM-dd");
            var displayStr = date.ToString("MMM dd");

            // Daily bookings
            int dailyBookings = businessBookings.Count(b => b.CreatedAt.ToString("yyyy-MM-dd") == dateStr);
            bookingTrends.Add(new BookingTrendPointDto { Date = displayStr, Bookings = dailyBookings });

            // Daily revenue
            decimal dailyRevenue = 0;
            foreach (var booking in businessBookings.Where(b => b.CreatedAt.ToString("yyyy-MM-dd") == dateStr && b.Status != BookingStatus.Cancelled && !b.JoinedWaitlist))
            {
                var slot = businessSlots.FirstOrDefault(s => s.Id == booking.SlotId);
                var offer = slot != null ? businessOffers.FirstOrDefault(o => o.Id == slot.OfferId) : null;
                if (offer != null)
                {
                    decimal price = offer.OfferPrice;
                    if (!string.IsNullOrEmpty(booking.CouponCode))
                    {
                        var coupon = couponList.FirstOrDefault(c => c.Code.ToLower() == booking.CouponCode.ToLower());
                        if (coupon != null)
                        {
                            if (coupon.DiscountType == "Percentage")
                            {
                                price = price * (1 - (coupon.Value / 100));
                            }
                            else
                            {
                                price = Math.Max(0, price - (coupon.Value / booking.PeopleCount));
                            }
                        }
                    }
                    dailyRevenue += price * booking.PeopleCount;
                }
            }
            revenueTrends.Add(new RevenueTrendPointDto { Date = displayStr, Revenue = Math.Round(dailyRevenue) });
        }

        // Capacity Utilization
        var capacityUtilization = new List<CapacityUtilizationPointDto>
        {
            new() { Name = "Booked Seats", Value = bookedSeats },
            new() { Name = "Available Seats", Value = availableSeats }
        };

        // Offer Performance (Top 5)
        var offerPerformance = businessOffers.Select(offer =>
        {
            var offerSlotIds = businessSlots.Where(s => s.OfferId == offer.Id).Select(s => s.Id).ToList();
            var offerBookings = businessBookings.Where(b => offerSlotIds.Contains(b.SlotId) && b.Status != BookingStatus.Cancelled && !b.JoinedWaitlist).ToList();

            int bookingsCount = offerBookings.Sum(b => b.PeopleCount);
            decimal revenue = 0;
            foreach (var ob in offerBookings)
            {
                decimal price = offer.OfferPrice;
                if (!string.IsNullOrEmpty(ob.CouponCode))
                {
                    var coupon = couponList.FirstOrDefault(c => c.Code.ToLower() == ob.CouponCode.ToLower());
                    if (coupon != null)
                    {
                        if (coupon.DiscountType == "Percentage")
                        {
                            price = price * (1 - (coupon.Value / 100));
                        }
                        else
                        {
                            price = Math.Max(0, price - (coupon.Value / ob.PeopleCount));
                        }
                    }
                }
                revenue += price * ob.PeopleCount;
            }

            return new OfferPerformancePointDto
            {
                Title = offer.Title,
                Bookings = bookingsCount,
                Revenue = Math.Round(revenue)
            };
        }).OrderByDescending(op => op.Bookings).Take(5).ToList();

        return new DashboardSummaryDto
        {
            TotalOffers = totalOffers,
            ActiveOffers = activeOffers,
            TotalBookings = totalBookings,
            TodaysBookings = todaysBookings,
            TotalCapacity = totalCapacity,
            BookedSeats = bookedSeats,
            AvailableSeats = availableSeats,
            ConversionRate = Math.Round(conversionRate, 2),
            Revenue = Math.Round(totalRevenue),
            BookingTrends = bookingTrends,
            RevenueTrends = revenueTrends,
            CapacityUtilization = capacityUtilization,
            OfferPerformance = offerPerformance
        };
    }
}
