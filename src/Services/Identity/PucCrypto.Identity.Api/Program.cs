using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.Identity.Application;
using PucCrypto.Identity.Infrastructure;
using PucCrypto.Identity.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var app = builder.Build();

await app.Services.ApplyMigrationsAsync();

app.MapHealthChecks("/health");
app.MapEndpoints();

app.Run();
