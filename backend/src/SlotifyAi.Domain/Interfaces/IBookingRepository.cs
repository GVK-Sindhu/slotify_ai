using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Domain.Interfaces;

public interface IBookingRepository : IRepository<Booking>
{
    Task<Booking?> GetBookingByReferenceAsync(string referenceNumber);
    Task<IEnumerable<Booking>> GetBookingsWithDetailsAsync();
    Task<IEnumerable<Booking>> GetWaitlistedBookingsForSlotAsync(Guid slotId);
}
