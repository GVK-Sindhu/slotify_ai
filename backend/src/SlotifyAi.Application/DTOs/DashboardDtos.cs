using System.Collections.Generic;

namespace SlotifyAi.Application.DTOs;

public class DashboardSummaryDto
{
    public int TotalOffers { get; set; }
    public int ActiveOffers { get; set; }
    public int TotalBookings { get; set; }
    public int TodaysBookings { get; set; }
    public int TotalCapacity { get; set; }
    public int BookedSeats { get; set; }
    public int AvailableSeats { get; set; }
    public double ConversionRate { get; set; }
    public decimal Revenue { get; set; }
    public List<BookingTrendPointDto> BookingTrends { get; set; } = new();
    public List<RevenueTrendPointDto> RevenueTrends { get; set; } = new();
    public List<CapacityUtilizationPointDto> CapacityUtilization { get; set; } = new();
    public List<OfferPerformancePointDto> OfferPerformance { get; set; } = new();
}

public class BookingTrendPointDto
{
    public string Date { get; set; } = string.Empty;
    public int Bookings { get; set; }
}

public class RevenueTrendPointDto
{
    public string Date { get; set; } = string.Empty;
    public decimal Revenue { get; set; }
}

public class CapacityUtilizationPointDto
{
    public string Name { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class OfferPerformancePointDto
{
    public string Title { get; set; } = string.Empty;
    public int Bookings { get; set; }
    public decimal Revenue { get; set; }
}
