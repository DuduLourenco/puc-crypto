# Contexto de build: raiz deste repositório.
# A compilação roda na arquitetura da máquina; a saída é portátil e serve a amd64 e arm64.
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /repo
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/ src/
RUN dotnet publish src/PucCrypto.MarketData.Api/PucCrypto.MarketData.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "PucCrypto.MarketData.Api.dll"]
