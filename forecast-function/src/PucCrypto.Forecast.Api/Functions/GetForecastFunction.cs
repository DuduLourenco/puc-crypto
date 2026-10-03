using System.Text.Json;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.Forecast.Application.Features.GetForecast;

namespace PucCrypto.Forecast.Api.Functions;

/// <summary>
/// Entrada HTTP da slice GetForecast: POST /api/forecast. Exige a chave da Function
/// (cabeçalho x-functions-key), que o BFF conhece.
/// </summary>
public sealed class GetForecastFunction(
    IValidator<GetForecastQuery> validator,
    IQueryHandler<GetForecastQuery, GetForecastResponse> handler)
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    [Function("GetForecast")]
    public async Task<IActionResult> RunAsync(
        [HttpTrigger(AuthorizationLevel.Function, "post", Route = "forecast")] HttpRequest request,
        CancellationToken cancellationToken)
    {
        GetForecastQuery? query;
        try
        {
            query = await JsonSerializer.DeserializeAsync<GetForecastQuery>(request.Body, SerializerOptions, cancellationToken);
        }
        catch (JsonException exception)
        {
            return ProblemResults.InvalidBody($"Corpo da requisição inválido: {exception.Message}");
        }

        if (query is null)
        {
            return ProblemResults.InvalidBody("Corpo da requisição vazio.");
        }

        var validation = await validator.ValidateAsync(query, cancellationToken);

        if (!validation.IsValid)
        {
            return ProblemResults.Validation(validation);
        }

        var result = await handler.HandleAsync(query, cancellationToken);

        return result.IsSuccess
            ? new OkObjectResult(result.Value)
            : ProblemResults.From(result.Error!);
    }
}
