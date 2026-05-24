using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Enums;

namespace SlotifyAi.WebApi.Controllers;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetBookings()
    {
        var result = await _bookingService.GetBookingsAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBookingById(Guid id)
    {
        var result = await _bookingService.GetBookingByIdAsync(id);
        if (result == null) return NotFound(new { error = "Booking not found." });
        return Ok(result);
    }

    [HttpGet("ref/{referenceNumber}")]
    public async Task<IActionResult> GetBookingByReference(string referenceNumber)
    {
        var result = await _bookingService.GetBookingByReferenceAsync(referenceNumber);
        if (result == null) return NotFound(new { error = "Booking reference not found." });
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateBooking([FromBody] CreateBookingRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _bookingService.CreateBookingAsync(request);
        return CreatedAtAction(nameof(GetBookingById), new { id = result.Id }, result);
    }

    // Accessible publicly so that customers can cancel via links
    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] UpdateBookingStatusRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _bookingService.UpdateBookingStatusAsync(id, request.Status);
        if (result == null) return NotFound(new { error = "Booking not found." });
        return Ok(result);
    }

    [Authorize]
    [HttpPut("{id}/payment")]
    public async Task<IActionResult> UpdateBookingPayment(Guid id, [FromBody] UpdateBookingPaymentRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _bookingService.UpdateBookingPaymentStatusAsync(id, request.PaymentStatus);
        if (result == null) return NotFound(new { error = "Booking not found." });
        return Ok(result);
    }
}
