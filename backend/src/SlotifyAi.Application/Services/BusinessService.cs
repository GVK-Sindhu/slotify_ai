using System;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;

namespace SlotifyAi.Application.Services;

public class BusinessService : IBusinessService
{
    private readonly IUnitOfWork _unitOfWork;

    public BusinessService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<BusinessDto?> GetBusinessByUserIdAsync(Guid userId)
    {
        var business = await _unitOfWork.Businesses.GetByUserIdAsync(userId);
        if (business == null) return null;

        return MapToDto(business);
    }

    public async Task<BusinessDto> UpsertBusinessAsync(Guid userId, UpsertBusinessRequest request)
    {
        var business = await _unitOfWork.Businesses.GetByUserIdAsync(userId);
        
        var openTime = TimeSpan.Parse(request.OpeningTime);
        var closeTime = TimeSpan.Parse(request.ClosingTime);

        if (business == null)
        {
            business = new Business
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = request.Name,
                Type = request.Type,
                OwnerName = request.OwnerName,
                Phone = request.Phone,
                Email = request.Email,
                Address = request.Address,
                City = request.City,
                LogoUrl = request.LogoUrl,
                OpeningTime = openTime,
                ClosingTime = closeTime,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Businesses.AddAsync(business);
        }
        else
        {
            business.Name = request.Name;
            business.Type = request.Type;
            business.OwnerName = request.OwnerName;
            business.Phone = request.Phone;
            business.Email = request.Email;
            business.Address = request.Address;
            business.City = request.City;
            business.LogoUrl = request.LogoUrl;
            business.OpeningTime = openTime;
            business.ClosingTime = closeTime;
            business.UpdatedAt = DateTime.UtcNow;
            
            _unitOfWork.Businesses.Update(business);
        }

        await _unitOfWork.CompleteAsync();
        return MapToDto(business);
    }

    private static BusinessDto MapToDto(Business business)
    {
        return new BusinessDto
        {
            Id = business.Id,
            UserId = business.UserId,
            Name = business.Name,
            Type = business.Type.ToString(),
            OwnerName = business.OwnerName,
            Phone = business.Phone,
            Email = business.Email,
            Address = business.Address,
            City = business.City,
            LogoUrl = business.LogoUrl,
            OpeningTime = business.OpeningTime.ToString(@"hh\:mm"),
            ClosingTime = business.ClosingTime.ToString(@"hh\:mm")
        };
    }
}
