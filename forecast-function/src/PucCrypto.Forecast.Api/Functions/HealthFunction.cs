using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;

namespace PucCrypto.Forecast.Api.Functions;

/// <summary>GET /api/health, sem chave: indica que o Function App está no ar.</summary>
public sealed class HealthFunction
{
    [Function("Health")]
    public IActionResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "health")] HttpRequest request) =>
        new OkObjectResult(new { status = "Healthy" });
}
