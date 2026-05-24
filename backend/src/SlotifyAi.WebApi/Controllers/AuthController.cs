using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;

namespace SlotifyAi.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _authService.LoginAsync(request);
        if (result == null)
        {
            return Unauthorized(new { error = "Invalid email or password. Hint: Use Admin123!" });
        }

        return Ok(result);
    }
}
