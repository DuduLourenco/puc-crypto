using FluentValidation;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Application.Features.RegisterUser;

internal sealed class RegisterUserValidator : AbstractValidator<RegisterUserCommand>
{
    public RegisterUserValidator()
    {
        RuleFor(command => command.Name).NotEmpty().MaximumLength(User.NameMaxLength);
        RuleFor(command => command.Email).NotEmpty().EmailAddress().MaximumLength(User.EmailMaxLength);
        RuleFor(command => command.Password).NotEmpty().MinimumLength(8).MaximumLength(72);
    }
}
