using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PucCrypto.Forecast.Application;
using PucCrypto.Forecast.Infrastructure;

var builder = FunctionsApplication.CreateBuilder(args);

// Integração com o ASP.NET Core: as Functions HTTP recebem HttpRequest e devolvem IActionResult.
builder.ConfigureFunctionsWebApplication();

// Respostas JSON com acentos legíveis (sem escapar caracteres fora do ASCII).
builder.Services.Configure<JsonOptions>(options =>
    options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Build().Run();
