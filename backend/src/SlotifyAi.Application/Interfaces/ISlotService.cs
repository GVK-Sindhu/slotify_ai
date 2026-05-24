using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;

namespace SlotifyAi.Application.Interfaces;

public interface ISlotService
{
    Task<IEnumerable<SlotDto>> GetSlotsAsync();
    Task<IEnumerable<SlotDto>> GetSlotsByOfferIdAsync(Guid offerId);
    Task<SlotDto?> GetSlotByIdAsync(Guid id);
    Task<SlotDto> CreateSlotAsync(CreateSlotRequest request);
    Task<SlotDto?> UpdateSlotAsync(Guid id, UpdateSlotRequest request);
    Task<bool> DeleteSlotAsync(Guid id);
}
