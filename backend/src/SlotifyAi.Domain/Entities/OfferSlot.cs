using System;
using System.Collections.Generic;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Domain.Entities;

public class OfferSlot
{
    public Guid Id { get; set; }
    public Guid OfferId { get; set; }
    public DateTime SlotDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int Capacity { get; set; }
    public int BookedCount { get; set; }
    public int AvailableCount => Math.Max(0, Capacity - BookedCount);
    public SlotStatus Status { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Offer? Offer { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
