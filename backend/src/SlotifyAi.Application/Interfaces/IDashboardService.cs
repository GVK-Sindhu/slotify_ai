using System;
using System.Threading.Tasks;
using SlotifyAi.Application.DTOs;

namespace SlotifyAi.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetDashboardSummaryAsync(Guid businessId);
}
