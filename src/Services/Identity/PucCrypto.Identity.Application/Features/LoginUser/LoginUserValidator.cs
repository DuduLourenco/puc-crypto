using FluentValidation;

namespace PucCrypto.Identity.Application.Features.LoginUser;

internal sealed class LoginUserValidator : AbstractValidator<LoginUserCommand>
{
    public LoginUserValidator()
    {
        RuleFor(command => command.Email).NotEmpty();
        RuleFor(command => command.Password).NotEmpty();
    }
}
