using System;
using System.ComponentModel.DataAnnotations;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Application.DTOs;

public class SlotDto
{
    public Guid Id { get; set; }
    public Guid OfferId { get; set; }
    public DateTime SlotDate { get; set; }
    public string StartTime { get; set; } = string.Empty; // "HH:mm"
    public string EndTime { get; set; } = string.Empty; // "HH:mm"
    public int Capacity { get; set; }
    public int BookedCount { get; set; }
    public int AvailableCount { get; set; }
    public string Status { get; set; } = string.Empty; // Enum string
}

public class CreateSlotRequest
{
    [Required]
    public Guid OfferId { get; set; }

    [Required]
    public DateTime SlotDate { get; set; }

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string StartTime { get; set; } = string.Empty;

    [Required]
    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string EndTime { get; set; } = string.Empty;

    [Required]
    [Range(1, 500, ErrorMessage = "Capacity must be at least 1")]
    public int Capacity { get; set; }

    [Required]
    public SlotStatus Status { get; set; }
}

public class UpdateSlotRequest
{
    public DateTime? SlotDate { get; set; }

    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string? StartTime { get; set; }

    [RegularExpression(@"^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", ErrorMessage = "Invalid time format (HH:mm)")]
    public string? EndTime { get; set; }

    [Range(1, 500, ErrorMessage = "Capacity must be at least 1")]
    public int? Capacity { get; set; }

    public SlotStatus? Status { get; set; }
}
