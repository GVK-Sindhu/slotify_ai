using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;

namespace SlotifyAi.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse?> LoginAsync(LoginRequest request);
}
