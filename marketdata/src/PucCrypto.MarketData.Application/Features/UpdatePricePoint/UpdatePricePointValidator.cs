using FluentValidation;

namespace PucCrypto.MarketData.Application.Features.UpdatePricePoint;

internal sealed class UpdatePricePointValidator : AbstractValidator<UpdatePricePointRequest>
{
    public UpdatePricePointValidator()
    {
        RuleFor(request => request.PriceUsd).GreaterThan(0);
    }
}
