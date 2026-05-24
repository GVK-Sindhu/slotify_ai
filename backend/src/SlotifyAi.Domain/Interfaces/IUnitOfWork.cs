using System;
using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<User> Users { get; }
    IBusinessRepository Businesses { get; }
    IOfferRepository Offers { get; }
    ISlotRepository Slots { get; }
    IBookingRepository Bookings { get; }
    IRepository<Coupon> Coupons { get; }
    IRepository<NotificationLog> Notifications { get; }
    Task<int> CompleteAsync();
}
