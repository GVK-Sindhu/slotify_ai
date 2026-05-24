using System;

namespace SlotifyAi.Domain.Entities;

public class Coupon
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Percentage"; // "Percentage" or "FixedAmount"
    public decimal Value { get; set; }
    public decimal? MinBookingValue { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
