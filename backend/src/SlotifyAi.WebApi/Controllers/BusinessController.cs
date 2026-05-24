using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;

namespace SlotifyAi.WebApi.Controllers;

[ApiController]
[Route("api/business")]
public class BusinessController : ControllerBase
{
    private readonly IBusinessService _businessService;

    public BusinessController(IBusinessService businessService)
    {
        _businessService = businessService;
    }

    [HttpGet]
    public async Task<IActionResult> GetBusiness()
    {
        // For public pages, we can just load the first business, or if authenticated, load the user's business
        Guid userId = Guid.Empty;
        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (Guid.TryParse(claimId, out var parsedId))
        {
            userId = parsedId;
        }
        else
        {
            // Default seed user id for public queries
            userId = Guid.Parse("user-admin-uuid");
        }

        var business = await _businessService.GetBusinessByUserIdAsync(userId);
        if (business == null) return NotFound(new { error = "Business profile not found." });

        return Ok(business);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(Guid id, [FromBody] UpsertBusinessRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var claimId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(claimId, out var userId))
        {
            return Unauthorized();
        }

        var result = await _businessService.UpsertBusinessAsync(userId, request);
        return Ok(result);
    }
}
