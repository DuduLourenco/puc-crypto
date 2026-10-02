using FluentValidation;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Features.UpdateUserCrypto;

internal sealed class UpdateUserCryptoValidator : AbstractValidator<UpdateUserCryptoRequest>
{
    public UpdateUserCryptoValidator()
    {
        RuleFor(request => request.Notes).MaximumLength(UserCrypto.NotesMaxLength);
    }
}
