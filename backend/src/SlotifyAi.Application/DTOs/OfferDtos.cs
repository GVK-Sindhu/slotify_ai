using System;
using System.ComponentModel.DataAnnotations;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Application.DTOs;

public class OfferDto
{
    public Guid Id { get; set; }
    public Guid BusinessId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal OriginalPrice { get; set; }
    public decimal OfferPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public string EndTime { get; set; } = string.Empty; // "HH:mm"
    public int TotalCapacity { get; set; }
    public int MaxBookingPerCustomer { get; set; }
    public string TermsAndConditions { get; set; } = string.Empty;
    public string? BannerImageUrl { get; set; }
    public string Status { get; set; } = string.Empty; // Enum string
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateOfferRequest
{
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(1000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string Category { get; set; } = string.Empty;

    [Required]
    [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than 0")]
    public decimal OriginalPrice { get; set; }

    [Required]
    [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than 0")]
    public decimal OfferPrice { get; set; }

    [Required]
    public DateTime StartDate { get; set; }

    [Required]
    public DateTime EndDate { get; set; }

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string EndTime { get; set; } = string.Empty;

    [Required]
    [Range(1, 1000, ErrorMessage = "Capacity must be at least 1")]
    public int TotalCapacity { get; set; }

    [Required]
    [Range(1, 100, ErrorMessage = "Max bookings per customer must be at least 1")]
    public int MaxBookingPerCustomer { get; set; }

    [Required]
    public string TermsAndConditions { get; set; } = string.Empty;

    public string? BannerImageUrl { get; set; }

    [Required]
    public OfferStatus Status { get; set; }
}

public class UpdateOfferRequest
{
    [StringLength(100)]
    public string? Title { get; set; }

    [StringLength(1000)]
    public string? Description { get; set; }

    [StringLength(50)]
    public string? Category { get; set; }

    [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than 0")]
    public decimal? OriginalPrice { get; set; }

    [Range(0.01, 100000.00, ErrorMessage = "Price must be greater than 0")]
    public decimal? OfferPrice { get; set; }

    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string? StartTime { get; set; }

    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string? EndTime { get; set; }

    [Range(1, 1000, ErrorMessage = "Capacity must be at least 1")]
    public int? TotalCapacity { get; set; }

    [Range(1, 100, ErrorMessage = "Max bookings per customer must be at least 1")]
    public int? MaxBookingPerCustomer { get; set; }

    public string? TermsAndConditions { get; set; }
    public string? BannerImageUrl { get; set; }
    public OfferStatus? Status { get; set; }
}
