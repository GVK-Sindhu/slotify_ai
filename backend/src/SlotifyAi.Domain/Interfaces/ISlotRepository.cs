using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Domain.Interfaces;

public interface ISlotRepository : IRepository<OfferSlot>
{
    Task<IEnumerable<OfferSlot>> GetSlotsByOfferIdAsync(Guid offerId);
}
