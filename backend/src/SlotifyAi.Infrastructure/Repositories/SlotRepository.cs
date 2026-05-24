using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;

namespace SlotifyAi.Infrastructure.Repositories;

public class SlotRepository : Repository<OfferSlot>, ISlotRepository
{
    private SlotifyContext SlotifyContext => (Context as SlotifyContext)!;

    public SlotRepository(SlotifyContext context) : base(context)
    {
    }

    public async Task<IEnumerable<OfferSlot>> GetSlotsByOfferIdAsync(Guid offerId)
    {
        return await SlotifyContext.Slots
            .Where(s => s.OfferId == offerId)
            .OrderBy(s => s.SlotDate)
            .ThenBy(s => s.StartTime)
            .ToListAsync();
    }
}
