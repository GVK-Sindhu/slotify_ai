using System.Threading.Tasks;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Application.Interfaces;

public interface INotificationService
{
    Task SendBookingConfirmationAsync(Booking booking, OfferSlot slot, Offer offer, Business business);
    Task SendWaitlistNotificationAsync(Booking booking, OfferSlot slot, Offer offer, Business business);
    Task SendPromotionNotificationAsync(Booking booking, OfferSlot slot, Offer offer, Business business);
}
