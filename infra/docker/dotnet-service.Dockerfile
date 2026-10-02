# Dockerfile único para Gateway, BFF e APIs dos serviços.
# Contexto de build: raiz do repositório.
#   PROJECT_DIR  pasta que contém o projeto, relativa a src/ (ex.: Services/Identity)
#   PROJECT_NAME nome do projeto (ex.: PucCrypto.Identity.Api)

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG PROJECT_DIR
ARG PROJECT_NAME
WORKDIR /repo
COPY global.json Directory.Build.props Directory.Packages.props ./
COPY src/ src/
RUN dotnet publish "src/${PROJECT_DIR}/${PROJECT_NAME}/${PROJECT_NAME}.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
ARG PROJECT_NAME
ENV APP_DLL=${PROJECT_NAME}.dll
WORKDIR /app
COPY --from=build /app/publish .
USER app
EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec dotnet \"$APP_DLL\""]
