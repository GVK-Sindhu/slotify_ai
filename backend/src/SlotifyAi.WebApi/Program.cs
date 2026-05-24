using System;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SlotifyAi.Application.Interfaces;
using SlotifyAi.Application.Services;
using SlotifyAi.Domain.Entities;
using SlotifyAi.Domain.Interfaces;
using SlotifyAi.Infrastructure.Data;
using SlotifyAi.Infrastructure.Repositories;
using SlotifyAi.Infrastructure.Security;
using SlotifyAi.Infrastructure.Services;
using SlotifyAi.WebApi.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Connection (PostgreSQL)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? 
                       "Host=localhost;Database=slotify_db;Username=postgres;Password=postgres";
builder.Services.AddDbContext<SlotifyContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly("SlotifyAi.Infrastructure")));

// 2. Dependency Injection
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<INotificationService, NotificationService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddScoped<IOfferService, OfferService>();
builder.Services.AddScoped<ISlotService, SlotService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();

// 3. Controllers & Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Slotify AI API", Version = "v1" });
    
    // Add JWT Authentication Support in Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// 4. JWT Authentication configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "SlotifyAiSuperSecretKeyForDevelopmentPurposes12345!";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "SlotifyAi",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "SlotifyAiClients",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero
    };
});

// 5. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// 6. Middleware Pipeline
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Slotify AI API v1"));
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// 7. Seed Database Admin on Start
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<SlotifyContext>();
        var hasher = services.GetRequiredService<IPasswordHasher>();
        await context.Database.EnsureCreatedAsync();

        if (!context.Users.Any())
        {
            var adminId = Guid.NewGuid();
            var adminUser = new User
            {
                Id = adminId,
                Email = "admin@slotify.ai",
                PasswordHash = hasher.HashPassword("Admin123!"),
                FullName = "Alex Carter",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            
            var defaultBusiness = new Business
            {
                Id = Guid.NewGuid(),
                UserId = adminId,
                Name = "Apex Fitness & Spa",
                Type = SlotifyAi.Domain.Enums.BusinessType.Gym,
                OwnerName = "Alex Carter",
                Phone = "+1 (555) 234-5678",
                Email = "hello@apexfitness.com",
                Address = "742 Evergreens Blvd, Suite 100",
                City = "Metropolis",
                LogoUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80",
                OpeningTime = new TimeSpan(6, 0, 0),
                ClosingTime = new TimeSpan(22, 0, 0),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(adminUser);
            await context.Businesses.AddAsync(defaultBusiness);
            
            // Seed a welcome coupon
            await context.Coupons.AddAsync(new Coupon
            {
                Code = "WELCOME10",
                DiscountType = "Percentage",
                Value = 10,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            });

            await context.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

app.Run();
namespace SlotifyAi.WebApi { public partial class Program { } } // For integration testing
