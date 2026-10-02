using Microsoft.OpenApi.Models;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.Identity.Application;
using PucCrypto.Identity.Infrastructure;
using PucCrypto.Identity.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options => options.SwaggerDoc("v1", new OpenApiInfo
{
    Title = "PucCrypto Identity API",
    Version = "v1",
    Description = "Cadastro de usuários e login com emissão de JWT."
}));

var app = builder.Build();

await app.Services.ApplyMigrationsAsync();

app.UseSwagger();
app.UseSwaggerUI();

app.MapHealthChecks("/health");
app.MapEndpoints();

app.Run();
