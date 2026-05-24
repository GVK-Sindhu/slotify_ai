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

public class OfferService : IOfferService
{
    private readonly IUnitOfWork _unitOfWork;

    public OfferService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<IEnumerable<OfferDto>> GetOffersAsync(string? category = null, string? search = null)
    {
        var offers = await _unitOfWork.Offers.GetOffersWithBusinessAsync(category, search);
        return offers.Select(MapToDto);
    }

    public async Task<OfferDto?> GetOfferByIdAsync(Guid id)
    {
        var offer = await _unitOfWork.Offers.GetByIdAsync(id);
        if (offer == null || offer.IsDeleted) return null;
        return MapToDto(offer);
    }

    public async Task<OfferDto> CreateOfferAsync(Guid businessId, CreateOfferRequest request)
    {
        if (request.OfferPrice >= request.OriginalPrice)
        {
            throw new ArgumentException("Offer price must be less than the original price.");
        }

        var offer = new Offer
        {
            Id = Guid.NewGuid(),
            BusinessId = businessId,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            OriginalPrice = request.OriginalPrice,
            OfferPrice = request.OfferPrice,
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            StartTime = TimeSpan.Parse(request.StartTime),
            EndTime = TimeSpan.Parse(request.EndTime),
            TotalCapacity = request.TotalCapacity,
            MaxBookingPerCustomer = request.MaxBookingPerCustomer,
            TermsAndConditions = request.TermsAndConditions,
            BannerImageUrl = request.BannerImageUrl,
            Status = request.Status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Offers.AddAsync(offer);
        await _unitOfWork.CompleteAsync();

        return MapToDto(offer);
    }

    public async Task<OfferDto?> UpdateOfferAsync(Guid id, UpdateOfferRequest request)
    {
        var offer = await _unitOfWork.Offers.GetByIdAsync(id);
        if (offer == null || offer.IsDeleted) return null;

        decimal originalPrice = request.OriginalPrice ?? offer.OriginalPrice;
        decimal offerPrice = request.OfferPrice ?? offer.OfferPrice;

        if (offerPrice >= originalPrice)
        {
            throw new ArgumentException("Offer price must be less than the original price.");
        }

        if (request.Title != null) offer.Title = request.Title;
        if (request.Description != null) offer.Description = request.Description;
        if (request.Category != null) offer.Category = request.Category;
        
        offer.OriginalPrice = originalPrice;
        offer.OfferPrice = offerPrice;

        if (request.StartDate != null) offer.StartDate = request.StartDate.Value.ToUniversalTime();
        if (request.EndDate != null) offer.EndDate = request.EndDate.Value.ToUniversalTime();
        if (request.StartTime != null) offer.StartTime = TimeSpan.Parse(request.StartTime);
        if (request.EndTime != null) offer.EndTime = TimeSpan.Parse(request.EndTime);
        if (request.TotalCapacity != null) offer.TotalCapacity = request.TotalCapacity.Value;
        if (request.MaxBookingPerCustomer != null) offer.MaxBookingPerCustomer = request.MaxBookingPerCustomer.Value;
        if (request.TermsAndConditions != null) offer.TermsAndConditions = request.TermsAndConditions;
        if (request.BannerImageUrl != null) offer.BannerImageUrl = request.BannerImageUrl;
        if (request.Status != null) offer.Status = request.Status.Value;

        offer.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Offers.Update(offer);
        await _unitOfWork.CompleteAsync();

        return MapToDto(offer);
    }

    public async Task<bool> DeleteOfferAsync(Guid id)
    {
        var offer = await _unitOfWork.Offers.GetByIdAsync(id);
        if (offer == null || offer.IsDeleted) return false;

        // Soft delete offer
        offer.IsDeleted = true;
        offer.UpdatedAt = DateTime.UtcNow;
        _unitOfWork.Offers.Update(offer);

        // Deactivate/Cancel slots
        var slots = await _unitOfWork.Slots.GetSlotsByOfferIdAsync(id);
        foreach (var slot in slots)
        {
            slot.Status = SlotStatus.Cancelled;
            slot.UpdatedAt = DateTime.UtcNow;
            _unitOfWork.Slots.Update(slot);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    private static OfferDto MapToDto(Offer offer)
    {
        return new OfferDto
        {
            Id = offer.Id,
            BusinessId = offer.BusinessId,
            Title = offer.Title,
            Description = offer.Description,
            Category = offer.Category,
            OriginalPrice = offer.OriginalPrice,
            OfferPrice = offer.OfferPrice,
            DiscountPercentage = offer.DiscountPercentage,
            StartDate = offer.StartDate,
            EndDate = offer.EndDate,
            StartTime = offer.StartTime.ToString(@"hh\:mm"),
            EndTime = offer.EndTime.ToString(@"hh\:mm"),
            TotalCapacity = offer.TotalCapacity,
            MaxBookingPerCustomer = offer.MaxBookingPerCustomer,
            TermsAndConditions = offer.TermsAndConditions,
            BannerImageUrl = offer.BannerImageUrl,
            Status = offer.Status.ToString(),
            CreatedAt = offer.CreatedAt,
            UpdatedAt = offer.UpdatedAt
        };
    }
}
