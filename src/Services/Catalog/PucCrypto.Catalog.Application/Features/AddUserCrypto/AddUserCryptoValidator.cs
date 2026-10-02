using FluentValidation;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

internal sealed class AddUserCryptoValidator : AbstractValidator<AddUserCryptoRequest>
{
    public AddUserCryptoValidator()
    {
        RuleFor(request => request.CoinGeckoId)
            .NotEmpty()
            .MaximumLength(Cryptocurrency.CoinGeckoIdMaxLength)
            .Matches("^[A-Za-z0-9-]+$");
        RuleFor(request => request.Symbol).NotEmpty().MaximumLength(Cryptocurrency.SymbolMaxLength);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(Cryptocurrency.NameMaxLength);
        RuleFor(request => request.Notes).MaximumLength(UserCrypto.NotesMaxLength);
    }
}
