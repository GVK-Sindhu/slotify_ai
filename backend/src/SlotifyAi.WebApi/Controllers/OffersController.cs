using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;

namespace SlotifyAi.WebApi.Controllers;

[ApiController]
[Route("api/offers")]
public class OffersController : ControllerBase
{
    private readonly IOfferService _offerService;
    private readonly IBusinessService _businessService;

    public OffersController(IOfferService offerService, IBusinessService businessService)
    {
        _offerService = offerService;
        _businessService = businessService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOffers([FromQuery] string? category, [FromQuery] string? search)
    {
        var result = await _offerService.GetOffersAsync(category, search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOfferById(Guid id)
    {
        var result = await _offerService.GetOfferByIdAsync(id);
        if (result == null) return NotFound(new { error = "Offer not found." });
        return Ok(result);
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] CreateOfferRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(claimId, out var userId))
        {
            return Unauthorized();
        }

        var business = await _businessService.GetBusinessByUserIdAsync(userId);
        if (business == null)
        {
            return BadRequest(new { error = "Please configure your business profile first." });
        }

        var result = await _offerService.CreateOfferAsync(business.Id, request);
        return CreatedAtAction(nameof(GetOfferById), new { id = result.Id }, result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromBody] UpdateOfferRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _offerService.UpdateOfferAsync(id, request);
        if (result == null) return NotFound(new { error = "Offer not found." });
        return Ok(result);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOffer(Guid id)
    {
        var succeeded = await _offerService.DeleteOfferAsync(id);
        if (!succeeded) return NotFound(new { error = "Offer not found." });
        return NoContent();
    }
}
