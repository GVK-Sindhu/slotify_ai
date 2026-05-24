using Microsoft.EntityFrameworkCore;
using SlotifyAi.Domain.Entities;

namespace SlotifyAi.Infrastructure.Data;

public class SlotifyContext : DbContext
{
    public SlotifyContext(DbContextOptions<SlotifyContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferSlot> Slots => Set<OfferSlot>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<NotificationLog> Notifications => Set<NotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(100);
        });

        // Business
        modelBuilder.Entity<Business>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.OwnerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Phone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Address).IsRequired().HasMaxLength(200);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            
            // 1-to-1 relationship with User
            entity.HasOne(b => b.User)
                  .WithOne(u => u.Business)
                  .HasForeignKey<Business>(b => b.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Offer
        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            entity.Property(e => e.Category).IsRequired().HasMaxLength(50);
            entity.Property(e => e.OriginalPrice).HasPrecision(18, 2);
            entity.Property(e => e.OfferPrice).HasPrecision(18, 2);
            
            // Query filter for soft delete
            entity.HasQueryFilter(o => !o.IsDeleted);

            entity.HasOne(o => o.Business)
                  .WithMany(b => b.Offers)
                  .HasForeignKey(o => o.BusinessId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // OfferSlot
        modelBuilder.Entity<OfferSlot>(entity =>
        {
            entity.HasKey(e => e.Id);
            
            entity.HasOne(s => s.Offer)
                  .WithMany(o => o.Slots)
                  .HasForeignKey(s => s.OfferId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReferenceNumber).IsUnique();
            entity.Property(e => e.ReferenceNumber).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(150);
            entity.Property(e => e.SpecialNote).HasMaxLength(500);
            entity.Property(e => e.CouponCode).HasMaxLength(50);

            entity.HasOne(b => b.Slot)
                  .WithMany(s => s.Bookings)
                  .HasForeignKey(b => b.SlotId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Coupon
        modelBuilder.Entity<Coupon>(entity =>
        {
            entity.HasKey(e => e.Code);
            entity.Property(e => e.Code).HasMaxLength(50);
            entity.Property(e => e.DiscountType).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Value).HasPrecision(18, 2);
            entity.Property(e => e.MinBookingValue).HasPrecision(18, 2);
        });

        // NotificationLog
        modelBuilder.Entity<NotificationLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CustomerName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Destination).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(1000);
        });
    }
}
