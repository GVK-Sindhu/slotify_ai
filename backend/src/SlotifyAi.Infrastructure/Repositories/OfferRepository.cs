using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;

namespace SlotifyAi.Infrastructure.Repositories;

public class OfferRepository : Repository<Offer>, IOfferRepository
{
    private SlotifyContext SlotifyContext => (Context as SlotifyContext)!;

    public OfferRepository(SlotifyContext context) : base(context)
    {
    }

    public async Task<Offer?> GetOfferWithSlotsAsync(Guid id)
    {
        return await SlotifyContext.Offers
            .Include(o => o.Slots)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<IEnumerable<Offer>> GetOffersWithBusinessAsync(string? category = null, string? search = null)
    {
        var query = SlotifyContext.Offers
            .Include(o => o.Business)
            .Include(o => o.Slots)
            .AsQueryable();

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(o => o.Category.ToLower() == category.ToLower());
        }

        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(o => o.Title.ToLower().Contains(searchLower) || 
                                     o.Description.ToLower().Contains(searchLower));
        }

        return await query.ToListAsync();
    }
}
