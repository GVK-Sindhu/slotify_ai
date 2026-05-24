using System;

namespace SlotifyAi.Domain.Entities;

public class NotificationLog
{
    public Guid Id { get; set; }
    public Guid BookingId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // "Email" | "SMS" | "WhatsApp"
    public string Destination { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "Sent"; // "Sent" | "Failed"
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
