# Contexto de build: raiz deste repositório.
# A compilação roda na arquitetura da máquina; a imagem final é a do runtime do Azure Functions.
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /repo
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/ src/
RUN dotnet publish src/PucCrypto.Forecast.Api/PucCrypto.Forecast.Api.csproj -c Release -o /home/site/wwwroot

FROM mcr.microsoft.com/azure-functions/dotnet-isolated:4-dotnet-isolated8.0
ENV AzureWebJobsScriptRoot=/home/site/wwwroot \
    AzureFunctionsJobHost__Logging__Console__IsEnabled=true
COPY --from=build /home/site/wwwroot /home/site/wwwroot
