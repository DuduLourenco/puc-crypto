using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Features.AddUserCrypto;
using PucCrypto.Catalog.Application.Features.GetUserCrypto;
using PucCrypto.Catalog.Application.Features.ListUserCryptos;
using PucCrypto.Catalog.Application.Features.RemoveUserCrypto;
using PucCrypto.Catalog.Application.Features.UpdateUserCrypto;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;
using PucCrypto.Catalog.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Application;

/// <summary>Slices da lista do usuário: AddUserCrypto, ListUserCryptos, GetUserCrypto, UpdateUserCrypto e RemoveUserCrypto.</summary>
public sealed class UserCryptoHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);
    private static readonly Guid Ana = Guid.NewGuid();
    private static readonly Guid Bruno = Guid.NewGuid();

    private readonly InMemoryCryptocurrencyRepository _cryptocurrencies = new();
    private readonly InMemoryUserCryptoRepository _userCryptos = new();
    private readonly Cryptocurrency _bitcoin = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime);

    public UserCryptoHandlerTests() => _cryptocurrencies.Items.Add(_bitcoin);

    private AddUserCryptoHandler AddHandler => new(_cryptocurrencies, _userCryptos, new FixedTimeProvider(Now));

    [Fact]
    public async Task AddUserCrypto_AdicionaCriptomoedaDoCatalogoALista()
    {
        var result = await AddHandler.HandleAsync(new AddUserCryptoCommand(Ana, _bitcoin.Id, "longo prazo"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("BTC", result.Value.Symbol);
        Assert.Equal("longo prazo", result.Value.Notes);
        Assert.Equal(Ana, Assert.Single(_userCryptos.Items).UserId);
    }

    [Fact]
    public async Task AddUserCrypto_RecusaCriptomoedaForaDoCatalogo()
    {
        var result = await AddHandler.HandleAsync(new AddUserCryptoCommand(Ana, Guid.NewGuid(), null), CancellationToken.None);

        Assert.Equal("Catalog.CryptoNotFound", result.Error!.Code);
        Assert.Empty(_userCryptos.Items);
    }

    [Fact]
    public async Task AddUserCrypto_RecusaRepeticaoNaListaDoMesmoUsuario_MasPermiteOutroUsuario()
    {
        await AddHandler.HandleAsync(new AddUserCryptoCommand(Ana, _bitcoin.Id, null), CancellationToken.None);

        var repeated = await AddHandler.HandleAsync(new AddUserCryptoCommand(Ana, _bitcoin.Id, null), CancellationToken.None);
        var otherUser = await AddHandler.HandleAsync(new AddUserCryptoCommand(Bruno, _bitcoin.Id, null), CancellationToken.None);

        Assert.Equal(ErrorType.Conflict, repeated.Error!.Type);
        Assert.True(otherUser.IsSuccess);
        Assert.Equal(2, _userCryptos.Items.Count);
    }

    [Fact]
    public async Task ListUserCryptos_DevolveApenasOsItensDoUsuario()
    {
        _userCryptos.Items.Add(UserCrypto.Create(Ana, _bitcoin, null, Now.UtcDateTime));
        _userCryptos.Items.Add(UserCrypto.Create(Bruno, _bitcoin, null, Now.UtcDateTime));

        var result = await new ListUserCryptosHandler(_userCryptos).HandleAsync(new ListUserCryptosQuery(Ana), CancellationToken.None);

        Assert.Single(result.Value);
    }

    [Fact]
    public async Task ItemDeOutroUsuario_ComportaSeComoInexistente()
    {
        var item = UserCrypto.Create(Ana, _bitcoin, "da Ana", Now.UtcDateTime);
        _userCryptos.Items.Add(item);

        var get = await new GetUserCryptoHandler(_userCryptos).HandleAsync(new GetUserCryptoQuery(Bruno, item.Id), CancellationToken.None);
        var update = await new UpdateUserCryptoHandler(_userCryptos).HandleAsync(new UpdateUserCryptoCommand(Bruno, item.Id, "x"), CancellationToken.None);
        var remove = await new RemoveUserCryptoHandler(_userCryptos).HandleAsync(new RemoveUserCryptoCommand(Bruno, item.Id), CancellationToken.None);

        Assert.All([get.Error, update.Error, remove.Error], error => Assert.Equal("Catalog.UserCryptoNotFound", error!.Code));
        Assert.Equal("da Ana", item.Notes);
        Assert.Single(_userCryptos.Items);
    }

    [Fact]
    public async Task UpdateUserCrypto_AlteraAnotacao()
    {
        var item = UserCrypto.Create(Ana, _bitcoin, "antiga", Now.UtcDateTime);
        _userCryptos.Items.Add(item);

        var result = await new UpdateUserCryptoHandler(_userCryptos).HandleAsync(new UpdateUserCryptoCommand(Ana, item.Id, "nova"), CancellationToken.None);

        Assert.Equal("nova", result.Value.Notes);
    }

    [Fact]
    public async Task RemoveUserCrypto_RemoveDaListaEMantemNoCatalogo()
    {
        var item = UserCrypto.Create(Ana, _bitcoin, null, Now.UtcDateTime);
        _userCryptos.Items.Add(item);

        var result = await new RemoveUserCryptoHandler(_userCryptos).HandleAsync(new RemoveUserCryptoCommand(Ana, item.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(_userCryptos.Items);
        Assert.Single(_cryptocurrencies.Items);
    }
}
