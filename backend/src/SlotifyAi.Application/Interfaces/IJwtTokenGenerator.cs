using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Application.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
}
