using System;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;

namespace SlotifyAi.Application.Interfaces;

public interface IBusinessService
{
    Task<BusinessDto?> GetBusinessByUserIdAsync(Guid userId);
    Task<BusinessDto> UpsertBusinessAsync(Guid userId, UpsertBusinessRequest request);
}
