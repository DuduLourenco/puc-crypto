using PucCrypto.Catalog.Application.Features.AddUserCrypto;
using PucCrypto.Catalog.Application.Features.CreateCrypto;
using PucCrypto.Catalog.Application.Features.UpdateCrypto;
using PucCrypto.Catalog.Application.Features.UpdateUserCrypto;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Application;

public sealed class ValidatorTests
{
    [Fact]
    public void CreateCrypto_AceitaDadosValidos()
    {
        Assert.True(new CreateCryptoValidator().Validate(new CreateCryptoCommand("bitcoin", "BTC", "Bitcoin")).IsValid);
    }

    [Theory]
    [InlineData("tem espaço", "BTC", "Bitcoin", "CoinGeckoId")]
    [InlineData("", "BTC", "Bitcoin", "CoinGeckoId")]
    [InlineData("bitcoin", "", "Bitcoin", "Symbol")]
    [InlineData("bitcoin", "SIMBOLOLONGO", "Bitcoin", "Symbol")]
    [InlineData("bitcoin", "BTC", "", "Name")]
    public void CreateCrypto_RecusaCampoInvalido(string coinGeckoId, string symbol, string name, string invalidField)
    {
        var result = new CreateCryptoValidator().Validate(new CreateCryptoCommand(coinGeckoId, symbol, name));

        Assert.Contains(result.Errors, error => error.PropertyName == invalidField);
    }

    [Fact]
    public void UpdateCrypto_ExigeSimboloENome()
    {
        var result = new UpdateCryptoValidator().Validate(new UpdateCryptoRequest("", ""));

        Assert.Equal(2, result.Errors.Select(error => error.PropertyName).Distinct().Count());
    }

    [Fact]
    public void AddUserCrypto_ExigeACriptomoeda()
    {
        var result = new AddUserCryptoValidator().Validate(new AddUserCryptoRequest(Guid.Empty, null));

        Assert.Contains(result.Errors, error => error.PropertyName == "CryptocurrencyId");
    }

    [Fact]
    public void UpdateUserCrypto_LimitaOTamanhoDaAnotacao()
    {
        Assert.True(new UpdateUserCryptoValidator().Validate(new UpdateUserCryptoRequest(null)).IsValid);
        Assert.False(new UpdateUserCryptoValidator().Validate(new UpdateUserCryptoRequest(new string('a', 501))).IsValid);
    }
}
