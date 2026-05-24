using System;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;

namespace SlotifyAi.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly SlotifyContext _context;

    public IRepository<User> Users { get; }
    public IBusinessRepository Businesses { get; }
    public IOfferRepository Offers { get; }
    public ISlotRepository Slots { get; }
    public IBookingRepository Bookings { get; }
    public IRepository<Coupon> Coupons { get; }
    public IRepository<NotificationLog> Notifications { get; }

    public UnitOfWork(SlotifyContext context)
    {
        _context = context;
        Users = new Repository<User>(_context);
        Businesses = new BusinessRepository(_context);
        Offers = new OfferRepository(_context);
        Slots = new SlotRepository(_context);
        Bookings = new BookingRepository(_context);
        Coupons = new Repository<Coupon>(_context);
        Notifications = new Repository<NotificationLog>(_context);
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}
