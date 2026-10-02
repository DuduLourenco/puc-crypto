using FluentValidation;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Features.UpdateCrypto;

internal sealed class UpdateCryptoValidator : AbstractValidator<UpdateCryptoRequest>
{
    public UpdateCryptoValidator()
    {
        RuleFor(request => request.Symbol).NotEmpty().MaximumLength(Cryptocurrency.SymbolMaxLength);
        RuleFor(request => request.Name).NotEmpty().MaximumLength(Cryptocurrency.NameMaxLength);
    }
}
