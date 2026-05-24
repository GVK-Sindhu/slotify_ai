using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Enums;
using SlotifyAi.Domain.Interfaces;

namespace SlotifyAi.Application.Services;

public class SlotService : ISlotService
{
    private readonly IUnitOfWork _unitOfWork;

    public SlotService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<SlotDto>> GetSlotsAsync()
    {
        var slots = await _unitOfWork.Slots.GetAllAsync();
        return slots.Select(MapToDto);
    }

    public async Task<IEnumerable<SlotDto>> GetSlotsByOfferIdAsync(Guid offerId)
    {
        var slots = await _unitOfWork.Slots.GetSlotsByOfferIdAsync(offerId);
        return slots.Select(MapToDto);
    }

    public async Task<SlotDto?> GetSlotByIdAsync(Guid id)
    {
        var slot = await _unitOfWork.Slots.GetByIdAsync(id);
        if (slot == null) return null;
        return MapToDto(slot);
    }

    public async Task<SlotDto> CreateSlotAsync(CreateSlotRequest request)
    {
        var slot = new OfferSlot
        {
            Id = Guid.NewGuid(),
            OfferId = request.OfferId,
            SlotDate = request.SlotDate.Date,
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime),
            Capacity = request.Capacity,
            BookedCount = 0,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Slots.AddAsync(slot);
        await _unitOfWork.CompleteAsync();

        return MapToDto(slot);
    }

    public async Task<SlotDto?> UpdateSlotAsync(Guid id, UpdateSlotRequest request)
    {
        var slot = await _unitOfWork.Slots.GetByIdAsync(id);
        if (slot == null) return null;

        if (request.SlotDate != null) slot.SlotDate = request.SlotDate.Value.Date;
        if (request.StartTime != null) slot.StartTime = TimeSpan.Parse(request.StartTime);
        if (request.EndTime != null) slot.EndTime = TimeSpan.Parse(request.EndTime);
        
        if (request.Capacity != null)
        {
            slot.Capacity = request.Capacity.Value;
            if (slot.AvailableCount <= 0)
            {
                slot.Status = SlotStatus.Full;
            }
            else if (slot.Status == SlotStatus.Full && slot.AvailableCount > 0)
            {
                slot.Status = SlotStatus.Available;
            }
        }

        if (request.Status != null) slot.Status = request.Status.Value;

        slot.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Slots.Update(slot);
        await _unitOfWork.CompleteAsync();

        return MapToDto(slot);
    }

    public async Task<bool> DeleteSlotAsync(Guid id)
    {
        var slot = await _unitOfWork.Slots.GetByIdAsync(id);
        if (slot == null) return false;

        _unitOfWork.Slots.Remove(slot);
        await _unitOfWork.CompleteAsync();
        return true;
    }

    private static SlotDto MapToDto(OfferSlot slot)
    {
        return new SlotDto
        {
            Id = slot.Id,
            OfferId = slot.OfferId,
            SlotDate = slot.SlotDate,
            StartTime = slot.StartTime.ToString(@"hh\:mm"),
            EndTime = slot.EndTime.ToString(@"hh\:mm"),
            Capacity = slot.Capacity,
            BookedCount = slot.BookedCount,
            AvailableCount = slot.AvailableCount,
            Status = slot.Status.ToString()
        };
    }
}
