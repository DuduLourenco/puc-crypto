using FluentValidation;

namespace PucCrypto.MarketData.Application.Features.CreatePricePoint;

internal sealed class CreatePricePointValidator : AbstractValidator<CreatePricePointCommand>
{
    public CreatePricePointValidator(TimeProvider timeProvider)
    {
        RuleFor(command => command.CryptocurrencyId).NotEmpty();
        RuleFor(command => command.PriceUsd).GreaterThan(0);
        RuleFor(command => command.Timestamp)
            .NotEmpty()
            .Must(timestamp => timestamp.ToUniversalTime() <= timeProvider.GetUtcNow().UtcDateTime.AddMinutes(5))
            .WithMessage("O instante do preço não pode estar no futuro.");
    }
}
