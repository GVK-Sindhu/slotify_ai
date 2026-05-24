using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Domain.Interfaces;

public interface IOfferRepository : IRepository<Offer>
{
    Task<Offer?> GetOfferWithSlotsAsync(Guid id);
    Task<IEnumerable<Offer>> GetOffersWithBusinessAsync(string? category = null, string? search = null);
}
