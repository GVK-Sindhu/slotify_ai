using System;
using System.Collections.Generic;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Domain.Entities;

public class Offer
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public decimal DiscountPercentage 
    { 
        get 
        {
            if (OriginalPrice <= 0) return 0;
            return Math.Round(((OriginalPrice - OfferPrice) / OriginalPrice) * 100, 2);
        }
        private set { } // Required for EF Core or serialization if needed
    }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int TotalCapacity { get; set; }
    public int MaxBookingPerCustomer { get; set; }
    public string TermsAndConditions { get; set; } = string.Empty;
    public string? BannerImageUrl { get; set; }
    public OfferStatus Status { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public Business? Business { get; set; }
    public ICollection<OfferSlot> Slots { get; set; } = new List<OfferSlot>();
}
