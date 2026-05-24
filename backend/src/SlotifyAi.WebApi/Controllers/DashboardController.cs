using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.Interfaces;

namespace SlotifyAi.WebApi.Controllers;

[Authorize]
[ApiController]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly IBusinessService _businessService;

    public DashboardController(IDashboardService dashboardService, IBusinessService businessService)
    {
        _dashboardService = dashboardService;
        _businessService = businessService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
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

        var result = await _dashboardService.GetDashboardSummaryAsync(business.Id);
        return Ok(result);
    }
}
