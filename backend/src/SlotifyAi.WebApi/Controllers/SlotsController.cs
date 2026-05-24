using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;

namespace SlotifyAi.WebApi.Controllers;

[ApiController]
[Route("api/slots")]
public class SlotsController : ControllerBase
{
    private readonly ISlotService _slotService;

    public SlotsController(ISlotService slotService)
    {
        _slotService = slotService;
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetSlots()
    {
        var result = await _slotService.GetSlotsAsync();
        return Ok(result);
    }

    [HttpGet("/api/offers/{offerId}/slots")]
    public async Task<IActionResult> GetSlotsByOfferId(Guid offerId)
    {
        var result = await _slotService.GetSlotsByOfferIdAsync(offerId);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSlotById(Guid id)
    {
        var result = await _slotService.GetSlotByIdAsync(id);
        if (result == null) return NotFound(new { error = "Slot not found." });
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateSlot([FromBody] CreateSlotRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _slotService.CreateSlotAsync(request);
        return CreatedAtAction(nameof(GetSlotById), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSlot(Guid id, [FromBody] UpdateSlotRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _slotService.UpdateSlotAsync(id, request);
        if (result == null) return NotFound(new { error = "Slot not found." });
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteSlot(Guid id)
    {
        var succeeded = await _slotService.DeleteSlotAsync(id);
        if (!succeeded) return NotFound(new { error = "Slot not found." });
        return NoContent();
    }
}
