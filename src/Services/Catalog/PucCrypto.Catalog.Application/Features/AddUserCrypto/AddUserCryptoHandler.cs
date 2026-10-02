using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;
using PucCrypto.Contracts;

namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

internal sealed class AddUserCryptoHandler(
    ICryptocurrencyRepository cryptocurrencyRepository,
    IUserCryptoRepository userCryptoRepository,
    IEventBus eventBus,
    TimeProvider timeProvider) : ICommandHandler<AddUserCryptoCommand, UserCryptoResponse>
{
    private static readonly Error AlreadyAdded = Error.Conflict(
        "Catalog.UserCryptoAlreadyAdded",
        "Esta criptomoeda já está na sua lista.");

    public async Task<Result<UserCryptoResponse>> HandleAsync(
        AddUserCryptoCommand command,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var coinGeckoId = Cryptocurrency.NormalizeCoinGeckoId(command.CoinGeckoId);

        var cryptocurrency = await cryptocurrencyRepository.GetByCoinGeckoIdAsync(coinGeckoId, cancellationToken);
        var isNewInCatalog = cryptocurrency is null;

        if (cryptocurrency is null)
        {
            cryptocurrency = Cryptocurrency.Create(command.Symbol, command.Name, coinGeckoId, now);
        }
        else if (await userCryptoRepository.ExistsAsync(command.UserId, cryptocurrency.Id, cancellationToken))
        {
            return AlreadyAdded;
        }

        var userCrypto = UserCrypto.Create(command.UserId, cryptocurrency, command.Notes, now);

        await userCryptoRepository.AddAsync(userCrypto, cancellationToken);

        // O evento só é publicado quando a moeda entra no catálogo pela primeira vez.
        if (isNewInCatalog)
        {
            await eventBus.PublishAsync(
                new CryptoRegistered(
                    cryptocurrency.Id,
                    cryptocurrency.Symbol,
                    cryptocurrency.Name,
                    cryptocurrency.CoinGeckoId,
                    now),
                cancellationToken);
        }

        return UserCryptoResponse.From(userCrypto);
    }
}
