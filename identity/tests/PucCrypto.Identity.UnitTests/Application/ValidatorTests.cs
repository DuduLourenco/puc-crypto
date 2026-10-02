using PucCrypto.Identity.Application.Features.LoginUser;
using PucCrypto.Identity.Application.Features.RegisterUser;
using Xunit;

namespace PucCrypto.Identity.UnitTests.Application;

public sealed class ValidatorTests
{
    [Fact]
    public void RegisterUser_AceitaDadosValidos()
    {
        var result = new RegisterUserValidator().Validate(
            new RegisterUserCommand("Ana Souza", "ana@example.com", "senha-segura-1"));

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("", "ana@example.com", "senha-segura-1", "Name")]
    [InlineData("Ana", "nao-e-email", "senha-segura-1", "Email")]
    [InlineData("Ana", "ana@example.com", "curta", "Password")]
    public void RegisterUser_RecusaCampoInvalido(string name, string email, string password, string invalidField)
    {
        var result = new RegisterUserValidator().Validate(new RegisterUserCommand(name, email, password));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == invalidField);
    }

    [Fact]
    public void RegisterUser_RecusaSenhaAcimaDoLimiteDoBCrypt()
    {
        var result = new RegisterUserValidator().Validate(
            new RegisterUserCommand("Ana", "ana@example.com", new string('a', 73)));

        Assert.Contains(result.Errors, error => error.PropertyName == "Password");
    }

    [Theory]
    [InlineData("", "senha")]
    [InlineData("ana@example.com", "")]
    public void LoginUser_ExigeEmailESenha(string email, string password)
    {
        var result = new LoginUserValidator().Validate(new LoginUserCommand(email, password));

        Assert.False(result.IsValid);
    }
}
