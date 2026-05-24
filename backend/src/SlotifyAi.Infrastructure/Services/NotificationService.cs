using System;
using System.Threading.Tasks;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;

namespace SlotifyAi.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;

    public NotificationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task SendBookingConfirmationAsync(Booking booking, OfferSlot slot, Offer offer, Business business)
    {
        var timeLabel = $"{slot.StartTime:hh\\:mm} - {slot.EndTime:hh\\:mm}";
        var message = $"Hi {booking.CustomerName}, your booking is CONFIRMED for '{offer.Title}' at {business.Name} on {slot.SlotDate:yyyy-MM-dd} at {timeLabel}. People: {booking.PeopleCount}. Reference: {booking.ReferenceNumber}.";

        await LogNotificationAsync(booking.Id, booking.CustomerName, "SMS", booking.PhoneNumber, message);
        
        if (!string.IsNullOrEmpty(booking.Email))
        {
            await LogNotificationAsync(booking.Id, booking.CustomerName, "Email", booking.Email, message);
        }
    }

    public async Task SendWaitlistNotificationAsync(Booking booking, OfferSlot slot, Offer offer, Business business)
    {
        var timeLabel = $"{slot.StartTime:hh\\:mm} - {slot.EndTime:hh\\:mm}";
        var message = $"Hi {booking.CustomerName}, you have successfully joined the Waitlist for '{offer.Title}' at {business.Name} for {slot.SlotDate:yyyy-MM-dd} at {timeLabel}. Reference: {booking.ReferenceNumber}.";

        await LogNotificationAsync(booking.Id, booking.CustomerName, "SMS", booking.PhoneNumber, message);
        
        if (!string.IsNullOrEmpty(booking.Email))
        {
            await LogNotificationAsync(booking.Id, booking.CustomerName, "Email", booking.Email, message);
        }
    }

    public async Task SendPromotionNotificationAsync(Booking booking, OfferSlot slot, Offer offer, Business business)
    {
        var timeLabel = $"{slot.StartTime:hh\\:mm} - {slot.EndTime:hh\\:mm}";
        var message = $"Good news {booking.CustomerName}! A slot opened up. Your booking for '{offer.Title}' at {business.Name} has been promoted from the Waitlist and is now CONFIRMED. Reference: {booking.ReferenceNumber}.";

        await LogNotificationAsync(booking.Id, booking.CustomerName, "SMS", booking.PhoneNumber, message);
        
        if (!string.IsNullOrEmpty(booking.Email))
        {
            await LogNotificationAsync(booking.Id, booking.CustomerName, "Email", booking.Email, message);
        }
    }

    private async Task LogNotificationAsync(Guid bookingId, string customerName, string type, string destination, string message)
    {
        var log = new NotificationLog
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            CustomerName = customerName,
            Type = type,
            Destination = destination,
            Message = message,
            Status = "Sent",
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.Notifications.AddAsync(log);
        await _unitOfWork.CompleteAsync();
    }
}
