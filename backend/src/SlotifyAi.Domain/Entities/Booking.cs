using System;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; }
    public Guid SlotId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int PeopleCount { get; set; }
    public string? SpecialNote { get; set; }
    public BookingStatus Status { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
    public string? CouponCode { get; set; }
    public bool JoinedWaitlist { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public OfferSlot? Slot { get; set; }
}
