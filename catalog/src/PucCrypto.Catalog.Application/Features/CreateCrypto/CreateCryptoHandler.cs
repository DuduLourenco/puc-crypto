using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;
using PucCrypto.Catalog.Application.IntegrationEvents;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Features.CreateCrypto;

internal sealed class CreateCryptoHandler(
    ICryptocurrencyRepository cryptocurrencyRepository,
    IEventBus eventBus,
    TimeProvider timeProvider) : ICommandHandler<CreateCryptoCommand, CryptoResponse>
{
    private static readonly Error AlreadyRegistered = Error.Conflict(
        "Catalog.CryptoAlreadyRegistered",
        "Já existe uma criptomoeda cadastrada com este identificador da CoinGecko.");

    public async Task<Result<CryptoResponse>> HandleAsync(CreateCryptoCommand command, CancellationToken cancellationToken)
    {
        var coinGeckoId = Cryptocurrency.NormalizeCoinGeckoId(command.CoinGeckoId);

        if (await cryptocurrencyRepository.ExistsByCoinGeckoIdAsync(coinGeckoId, cancellationToken))
        {
            return AlreadyRegistered;
        }

        var now = timeProvider.GetUtcNow().UtcDateTime;
        var cryptocurrency = Cryptocurrency.Create(command.Symbol, command.Name, coinGeckoId, now);

        await cryptocurrencyRepository.AddAsync(cryptocurrency, cancellationToken);

        await eventBus.PublishAsync(
            new CryptoRegistered(
                cryptocurrency.Id,
                cryptocurrency.Symbol,
                cryptocurrency.Name,
                cryptocurrency.CoinGeckoId,
                now),
            cancellationToken);

        return CryptoResponse.From(cryptocurrency);
    }
}
