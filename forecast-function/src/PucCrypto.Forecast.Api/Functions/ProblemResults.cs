using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.Forecast.Api.Functions;

/// <summary>Respostas de erro no formato Problem Details, iguais às dos microsserviços.</summary>
internal static class ProblemResults
{
    public static IActionResult Validation(ValidationResult validation) =>
        new BadRequestObjectResult(new ValidationProblemDetails(validation.ToDictionary())
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "One or more validation errors occurred."
        });

    public static IActionResult InvalidBody(string detail) =>
        new BadRequestObjectResult(new ProblemDetails
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Forecast.InvalidBody",
            Detail = detail
        });

    public static IActionResult From(Error error)
    {
        var status = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError
        };

        return new ObjectResult(new ProblemDetails { Status = status, Title = error.Code, Detail = error.Message })
        {
            StatusCode = status
        };
    }
}
