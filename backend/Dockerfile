# Use official .NET 9 SDK image
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

WORKDIR /app


COPY Backend/*.csproj ./Backend/
RUN dotnet restore ./Backend/*.csproj


COPY Backend/. ./Backend/

WORKDIR /app/Backend
RUN dotnet publish -c Release -o out

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/Backend/out ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "Backend.dll"]
