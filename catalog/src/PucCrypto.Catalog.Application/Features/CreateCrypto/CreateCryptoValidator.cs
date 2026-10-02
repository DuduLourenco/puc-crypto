using FluentValidation;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Features.CreateCrypto;

internal sealed class CreateCryptoValidator : AbstractValidator<CreateCryptoCommand>
{
    public CreateCryptoValidator()
    {
        RuleFor(command => command.CoinGeckoId)
            .NotEmpty()
            .MaximumLength(Cryptocurrency.CoinGeckoIdMaxLength)
            .Matches("^[A-Za-z0-9-]+$");
        RuleFor(command => command.Symbol).NotEmpty().MaximumLength(Cryptocurrency.SymbolMaxLength);
        RuleFor(command => command.Name).NotEmpty().MaximumLength(Cryptocurrency.NameMaxLength);
    }
}
