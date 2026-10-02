using Microsoft.AspNetCore.Http;
using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.BuildingBlocks.Abstractions.Endpoints;

public static class ResultExtensions
{
    /// <summary>Converte a falha de um caso de uso em uma resposta HTTP no formato Problem Details.</summary>
    public static IResult ToProblem(this Result result)
    {
        var error = result.Error
            ?? throw new InvalidOperationException("Um resultado de sucesso não pode ser convertido em problema.");

        var statusCode = error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Unavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError
        };

        return TypedResults.Problem(statusCode: statusCode, title: error.Code, detail: error.Message);
    }
}
