using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Features.CreateCrypto;
using PucCrypto.Catalog.Application.Features.DeleteCrypto;
using PucCrypto.Catalog.Application.Features.GetCrypto;
using PucCrypto.Catalog.Application.Features.ListCryptos;
using PucCrypto.Catalog.Application.Features.UpdateCrypto;
using PucCrypto.Catalog.Application.IntegrationEvents;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;
using PucCrypto.Catalog.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.Catalog.UnitTests.Application;

/// <summary>Slices do CRUD do catálogo: CreateCrypto, GetCrypto, ListCryptos, UpdateCrypto e DeleteCrypto.</summary>
public sealed class CryptoHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 1, 1, 12, 0, 0, TimeSpan.Zero);

    private readonly InMemoryCryptocurrencyRepository _cryptocurrencies = new();
    private readonly InMemoryUserCryptoRepository _userCryptos = new();
    private readonly RecordingEventBus _eventBus = new();
    private readonly FixedTimeProvider _time = new(Now);

    [Fact]
    public async Task CreateCrypto_GravaEPublicaCryptoRegistered()
    {
        var handler = new CreateCryptoHandler(_cryptocurrencies, _eventBus, _time);

        var result = await handler.HandleAsync(new CreateCryptoCommand("Bitcoin", "btc", "Bitcoin"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var cryptocurrency = Assert.Single(_cryptocurrencies.Items);
        Assert.Equal("bitcoin", cryptocurrency.CoinGeckoId);
        var published = Assert.IsType<CryptoRegistered>(Assert.Single(_eventBus.Published));
        Assert.Equal(new CryptoRegistered(cryptocurrency.Id, "BTC", "Bitcoin", "bitcoin", Now.UtcDateTime), published);
    }

    [Fact]
    public async Task CreateCrypto_RecusaIdentificadorJaCadastrado_SemPublicarEvento()
    {
        _cryptocurrencies.Items.Add(Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime));
        var handler = new CreateCryptoHandler(_cryptocurrencies, _eventBus, _time);

        var result = await handler.HandleAsync(new CreateCryptoCommand("BITCOIN", "BTC", "Bitcoin"), CancellationToken.None);

        Assert.Equal("Catalog.CryptoAlreadyRegistered", result.Error!.Code);
        Assert.Equal(ErrorType.Conflict, result.Error.Type);
        Assert.Single(_cryptocurrencies.Items);
        Assert.Empty(_eventBus.Published);
    }

    [Fact]
    public async Task GetCrypto_DevolveNaoEncontradaParaIdInexistente()
    {
        var result = await new GetCryptoHandler(_cryptocurrencies).HandleAsync(new GetCryptoQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Equal("Catalog.CryptoNotFound", result.Error!.Code);
    }

    [Fact]
    public async Task ListCryptos_OrdenaPorNome()
    {
        _cryptocurrencies.Items.Add(Cryptocurrency.Create("SOL", "Solana", "solana", Now.UtcDateTime));
        _cryptocurrencies.Items.Add(Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime));

        var result = await new ListCryptosHandler(_cryptocurrencies).HandleAsync(new ListCryptosQuery(), CancellationToken.None);

        Assert.Equal(["Bitcoin", "Solana"], result.Value.Select(crypto => crypto.Name));
    }

    [Fact]
    public async Task UpdateCrypto_AlteraEGrava()
    {
        var cryptocurrency = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime);
        _cryptocurrencies.Items.Add(cryptocurrency);

        var result = await new UpdateCryptoHandler(_cryptocurrencies)
            .HandleAsync(new UpdateCryptoCommand(cryptocurrency.Id, "xbt", "Bitcoin (XBT)"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("XBT", result.Value.Symbol);
        Assert.Equal(1, _cryptocurrencies.Updates);
    }

    [Fact]
    public async Task UpdateCrypto_DevolveNaoEncontradaParaIdInexistente()
    {
        var result = await new UpdateCryptoHandler(_cryptocurrencies)
            .HandleAsync(new UpdateCryptoCommand(Guid.NewGuid(), "BTC", "Bitcoin"), CancellationToken.None);

        Assert.Equal(ErrorType.NotFound, result.Error!.Type);
    }

    [Fact]
    public async Task DeleteCrypto_ExcluiEPublicaCryptoRemoved()
    {
        var cryptocurrency = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime);
        _cryptocurrencies.Items.Add(cryptocurrency);
        var handler = new DeleteCryptoHandler(_cryptocurrencies, _userCryptos, _eventBus, _time);

        var result = await handler.HandleAsync(new DeleteCryptoCommand(cryptocurrency.Id), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(_cryptocurrencies.Items);
        var published = Assert.IsType<CryptoRemoved>(Assert.Single(_eventBus.Published));
        Assert.Equal(new CryptoRemoved(cryptocurrency.Id, "bitcoin", Now.UtcDateTime), published);
    }

    [Fact]
    public async Task DeleteCrypto_RecusaCriptomoedaNaListaDeUmUsuario()
    {
        var cryptocurrency = Cryptocurrency.Create("BTC", "Bitcoin", "bitcoin", Now.UtcDateTime);
        _cryptocurrencies.Items.Add(cryptocurrency);
        _userCryptos.Items.Add(UserCrypto.Create(Guid.NewGuid(), cryptocurrency, null, Now.UtcDateTime));
        var handler = new DeleteCryptoHandler(_cryptocurrencies, _userCryptos, _eventBus, _time);

        var result = await handler.HandleAsync(new DeleteCryptoCommand(cryptocurrency.Id), CancellationToken.None);

        Assert.Equal("Catalog.CryptoInUse", result.Error!.Code);
        Assert.Single(_cryptocurrencies.Items);
        Assert.Empty(_eventBus.Published);
    }

    [Fact]
    public async Task DeleteCrypto_DevolveNaoEncontradaParaIdInexistente()
    {
        var handler = new DeleteCryptoHandler(_cryptocurrencies, _userCryptos, _eventBus, _time);

        var result = await handler.HandleAsync(new DeleteCryptoCommand(Guid.NewGuid()), CancellationToken.None);

        Assert.Equal(ErrorType.NotFound, result.Error!.Type);
        Assert.Empty(_eventBus.Published);
    }
}
