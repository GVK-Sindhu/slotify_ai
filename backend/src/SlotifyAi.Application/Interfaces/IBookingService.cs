using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.Application.Interfaces;

public interface IBookingService
{
    Task<IEnumerable<BookingDto>> GetBookingsAsync();
    Task<BookingDto?> GetBookingByIdAsync(Guid id);
    Task<BookingDto?> GetBookingByReferenceAsync(string referenceNumber);
    Task<BookingDto> CreateBookingAsync(CreateBookingRequest request);
    Task<BookingDto?> UpdateBookingStatusAsync(Guid id, BookingStatus status);
    Task<BookingDto?> UpdateBookingPaymentStatusAsync(Guid id, PaymentStatus status);
}
