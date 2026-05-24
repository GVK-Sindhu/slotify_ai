using System.Linq;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Interfaces;

namespace SlotifyAi.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenGenerator _tokenGenerator;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, IJwtTokenGenerator tokenGenerator)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email.ToLower() == request.Email.ToLower());
        var user = users.FirstOrDefault();

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return null;
        }

        var token = _tokenGenerator.GenerateToken(user);

        return new AuthResponse
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                FullName = user.FullName
            }
        };
    }
}
