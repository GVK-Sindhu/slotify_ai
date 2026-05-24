FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy solution and project files
COPY SlotifyAi.sln ./
COPY src/SlotifyAi.Domain/SlotifyAi.Domain.csproj src/SlotifyAi.Domain/
COPY src/SlotifyAi.Application/SlotifyAi.Application.csproj src/SlotifyAi.Application/
COPY src/SlotifyAi.Infrastructure/SlotifyAi.Infrastructure.csproj src/SlotifyAi.Infrastructure/
COPY src/SlotifyAi.WebApi/SlotifyAi.WebApi.csproj src/SlotifyAi.WebApi/

# Restore dependencies
RUN dotnet restore

# Copy everything else
COPY src/ src/

# Build and publish
WORKDIR /app/src/SlotifyAi.WebApi
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

ENTRYPOINT ["dotnet", "SlotifyAi.WebApi.dll"]
