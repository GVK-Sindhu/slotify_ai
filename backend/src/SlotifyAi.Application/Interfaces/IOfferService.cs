using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;

namespace SlotifyAi.Application.Interfaces;

public interface IOfferService
{
    Task<IEnumerable<OfferDto>> GetOffersAsync(string? category = null, string? search = null);
    Task<OfferDto?> GetOfferByIdAsync(Guid id);
    Task<OfferDto> CreateOfferAsync(Guid businessId, CreateOfferRequest request);
    Task<OfferDto?> UpdateOfferAsync(Guid id, UpdateOfferRequest request);
    Task<bool> DeleteOfferAsync(Guid id);
}
