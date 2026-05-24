using System;
using System.ComponentModel.DataAnnotations;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Application.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid SlotId { get; set; }
    public string ReferenceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public int PeopleCount { get; set; }
    public string? SpecialNote { get; set; }
    public string Status { get; set; } = string.Empty; // Enum string
    public string PaymentStatus { get; set; } = string.Empty; // Enum string
    public string? CouponCode { get; set; }
    public bool JoinedWaitlist { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Enriched detail fields
    public string OfferTitle { get; set; } = string.Empty;
    public string SlotDateLabel { get; set; } = string.Empty;
    public string SlotTimeLabel { get; set; } = string.Empty;
}

public class CreateBookingRequest
{
    [Required]
    public Guid SlotId { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string CustomerName { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [Required]
    [Range(1, 20, ErrorMessage = "Booking must be for between 1 and 20 people")]
    public int PeopleCount { get; set; }

    public string? SpecialNote { get; set; }

    public string? CouponCode { get; set; }
}

public class UpdateBookingStatusRequest
{
    [Required]
    public BookingStatus Status { get; set; }
}

public class UpdateBookingPaymentRequest
{
    [Required]
    public PaymentStatus PaymentStatus { get; set; }
}
