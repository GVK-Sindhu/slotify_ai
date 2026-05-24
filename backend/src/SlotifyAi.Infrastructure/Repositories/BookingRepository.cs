using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Enums;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;

namespace SlotifyAi.Infrastructure.Repositories;

public class BookingRepository : Repository<Booking>, IBookingRepository
{
    private SlotifyContext SlotifyContext => (Context as SlotifyContext)!;

    public BookingRepository(SlotifyContext context) : base(context)
    {
    }

    public async Task<Booking?> GetBookingByReferenceAsync(string referenceNumber)
    {
        return await SlotifyContext.Bookings
            .Include(b => b.Slot)
            .ThenInclude(s => s!.Offer)
            .FirstOrDefaultAsync(b => b.ReferenceNumber.ToUpper() == referenceNumber.ToUpper());
    }

    public async Task<IEnumerable<Booking>> GetBookingsWithDetailsAsync()
    {
        return await SlotifyContext.Bookings
            .Include(b => b.Slot)
            .ThenInclude(s => s!.Offer)
            .ToListAsync();
    }

    public async Task<IEnumerable<Booking>> GetWaitlistedBookingsForSlotAsync(Guid slotId)
    {
        return await SlotifyContext.Bookings
            .Where(b => b.SlotId == slotId && b.JoinedWaitlist && b.Status == BookingStatus.Pending)
            .ToListAsync();
    }
}
