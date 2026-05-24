using System;
using System.ComponentModel.DataAnnotations;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Application.DTOs;

public class BusinessDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // Enum string representation
    public string OwnerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public string OpeningTime { get; set; } = string.Empty; // "HH:mm"
    public string ClosingTime { get; set; } = string.Empty; // "HH:mm"
}

public class UpsertBusinessRequest
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public BusinessType Type { get; set; }

    [Required]
    [StringLength(100)]
    public string OwnerName { get; set; } = string.Empty;

    [Required]
    [Phone]
    public string Phone { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Address { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string City { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string OpeningTime { get; set; } = string.Empty; // "HH:mm"

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string ClosingTime { get; set; } = string.Empty; // "HH:mm"
}
