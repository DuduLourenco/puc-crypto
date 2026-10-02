using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Features.AddUserCrypto;

internal sealed class AddUserCryptoHandler(
    ICryptocurrencyRepository cryptocurrencyRepository,
    IUserCryptoRepository userCryptoRepository,
    TimeProvider timeProvider) : ICommandHandler<AddUserCryptoCommand, UserCryptoResponse>
{
    private static readonly Error AlreadyAdded = Error.Conflict(
        "Catalog.UserCryptoAlreadyAdded",
        "Esta criptomoeda já está na sua lista.");

    public async Task<Result<UserCryptoResponse>> HandleAsync(
        AddUserCryptoCommand command,
        CancellationToken cancellationToken)
    {
        var cryptocurrency = await cryptocurrencyRepository.GetByIdAsync(command.CryptocurrencyId, cancellationToken);

        if (cryptocurrency is null)
        {
            return CryptoErrors.NotFound;
        }

        if (await userCryptoRepository.ExistsAsync(command.UserId, cryptocurrency.Id, cancellationToken))
        {
            return AlreadyAdded;
        }

        var userCrypto = UserCrypto.Create(
            command.UserId,
            cryptocurrency,
            command.Notes,
            timeProvider.GetUtcNow().UtcDateTime);

        await userCryptoRepository.AddAsync(userCrypto, cancellationToken);

        return UserCryptoResponse.From(userCrypto);
    }
}
