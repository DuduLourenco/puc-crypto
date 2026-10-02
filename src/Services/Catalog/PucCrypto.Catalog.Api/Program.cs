using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Authentication;
using PucCrypto.Catalog.Application;
using PucCrypto.Catalog.Infrastructure;
using PucCrypto.Catalog.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();

await app.Services.ApplyMigrationsAsync();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapEndpoints();

app.Run();
