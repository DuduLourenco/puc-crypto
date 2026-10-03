using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace PucCrypto.BuildingBlocks.Abstractions.Endpoints;

internal sealed class ValidationFilter<TRequest>(IValidator<TRequest> validator) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var request = context.Arguments.OfType<TRequest>().First();

        var validation = await validator.ValidateAsync(request, context.HttpContext.RequestAborted);

        return validation.IsValid
            ? await next(context)
            : TypedResults.ValidationProblem(validation.ToDictionary());
    }
}
