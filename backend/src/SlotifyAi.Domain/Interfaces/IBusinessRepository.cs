using System;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Domain.Interfaces;

public interface IBusinessRepository : IRepository<Business>
{
    Task<Business?> GetByUserIdAsync(Guid userId);
}
