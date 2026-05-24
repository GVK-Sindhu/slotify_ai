using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;

namespace SlotifyAi.Infrastructure.Repositories;

public class BusinessRepository : Repository<Business>, IBusinessRepository
{
    private SlotifyContext SlotifyContext => (Context as SlotifyContext)!;

    public BusinessRepository(SlotifyContext context) : base(context)
    {
    }

    public async Task<Business?> GetByUserIdAsync(Guid userId)
    {
        return await SlotifyContext.Businesses
            .FirstOrDefaultAsync(b => b.UserId == userId);
    }
}
