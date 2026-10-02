using FluentValidation;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

internal sealed class AddUserCryptoValidator : AbstractValidator<AddUserCryptoRequest>
{
    public AddUserCryptoValidator()
    {
        RuleFor(request => request.CryptocurrencyId).NotEmpty();
        RuleFor(request => request.Notes).MaximumLength(UserCrypto.NotesMaxLength);
    }
}
