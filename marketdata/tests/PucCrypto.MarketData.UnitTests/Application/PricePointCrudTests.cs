using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.MarketData.Application.Features.CreatePricePoint;
using PucCrypto.MarketData.Application.Features.DeletePricePoint;
using PucCrypto.MarketData.Application.Features.GetPricePoint;
using PucCrypto.MarketData.Application.Features.ListPricePoints;
using PucCrypto.MarketData.Application.Features.UpdatePricePoint;
using PucCrypto.MarketData.Domain.PricePoints;
using PucCrypto.MarketData.Domain.TrackedAssets;
using PucCrypto.MarketData.UnitTests.Fakes;
using Xunit;

namespace PucCrypto.MarketData.UnitTests.Application;

/// <summary>Slices do CRUD de preços.</summary>
public sealed class PricePointCrudTests
{
    private static readonly DateTime Now = new(2026, 1, 10, 12, 0, 0, DateTimeKind.Utc);

    private readonly InMemoryTrackedAssetRepository _assets = new();
    private readonly InMemoryPricePointRepository _prices = new();
    private readonly TrackedAsset _bitcoin = TrackedAsset.Create(Guid.NewGuid(), "bitcoin", "BTC", "Bitcoin", Now);

    public PricePointCrudTests() => _assets.Items.Add(_bitcoin);

    [Fact]
    public async Task Create_GravaPrecoManual()
    {
        var result = await new CreatePricePointHandler(_assets, _prices)
            .HandleAsync(new CreatePricePointCommand(_bitcoin.Id, Now, 65000m), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal("Manual", result.Value.Source);
        Assert.Single(_prices.Items);
    }

    [Fact]
    public async Task Create_RecusaAtivoNaoAcompanhadoEInstanteRepetido()
    {
        var handler = new CreatePricePointHandler(_assets, _prices);
        await handler.HandleAsync(new CreatePricePointCommand(_bitcoin.Id, Now, 1m), CancellationToken.None);

        var notTracked = await handler.HandleAsync(new CreatePricePointCommand(Guid.NewGuid(), Now, 1m), CancellationToken.None);
        var repeated = await handler.HandleAsync(new CreatePricePointCommand(_bitcoin.Id, Now, 2m), CancellationToken.None);

        Assert.Equal("MarketData.AssetNotTracked", notTracked.Error!.Code);
        Assert.Equal(ErrorType.Conflict, repeated.Error!.Type);
        Assert.Single(_prices.Items);
    }

    [Fact]
    public async Task List_DevolveOsMaisRecentesDentroDoLimiteEmOrdemCronologica()
    {
        for (var day = 1; day <= 5; day++)
        {
            _prices.Items.Add(PricePoint.Create(_bitcoin.Id, Now.AddDays(-day), day, PriceSource.CoinGecko));
        }

        var result = await new ListPricePointsHandler(_prices)
            .HandleAsync(new ListPricePointsQuery(_bitcoin.Id, null, null, 3), CancellationToken.None);

        Assert.Equal([3m, 2m, 1m], result.Value.Select(price => price.PriceUsd));
    }

    [Fact]
    public async Task GetUpdateDelete()
    {
        var pricePoint = PricePoint.Create(_bitcoin.Id, Now, 1m, PriceSource.Manual);
        _prices.Items.Add(pricePoint);

        var get = await new GetPricePointHandler(_prices).HandleAsync(new GetPricePointQuery(pricePoint.Id), CancellationToken.None);
        var update = await new UpdatePricePointHandler(_prices).HandleAsync(new UpdatePricePointCommand(pricePoint.Id, 2m), CancellationToken.None);
        var delete = await new DeletePricePointHandler(_prices).HandleAsync(new DeletePricePointCommand(pricePoint.Id), CancellationToken.None);
        var deleteAgain = await new DeletePricePointHandler(_prices).HandleAsync(new DeletePricePointCommand(pricePoint.Id), CancellationToken.None);

        Assert.True(get.IsSuccess);
        Assert.Equal(2m, update.Value.PriceUsd);
        Assert.True(delete.IsSuccess);
        Assert.Equal("MarketData.PricePointNotFound", deleteAgain.Error!.Code);
    }

    [Fact]
    public void Validadores()
    {
        var time = new FixedTimeProvider(new DateTimeOffset(Now));

        Assert.True(new CreatePricePointValidator(time).Validate(new CreatePricePointCommand(_bitcoin.Id, Now, 1m)).IsValid);
        Assert.False(new CreatePricePointValidator(time).Validate(new CreatePricePointCommand(_bitcoin.Id, Now.AddDays(1), 1m)).IsValid);
        Assert.False(new CreatePricePointValidator(time).Validate(new CreatePricePointCommand(Guid.Empty, Now, 0m)).IsValid);
        Assert.False(new UpdatePricePointValidator().Validate(new UpdatePricePointRequest(0m)).IsValid);
        Assert.False(new ListPricePointsValidator().Validate(new ListPricePointsQuery(_bitcoin.Id, Now, Now.AddDays(-1), null)).IsValid);
        Assert.False(new ListPricePointsValidator().Validate(new ListPricePointsQuery(_bitcoin.Id, null, null, 5000)).IsValid);
    }
}
