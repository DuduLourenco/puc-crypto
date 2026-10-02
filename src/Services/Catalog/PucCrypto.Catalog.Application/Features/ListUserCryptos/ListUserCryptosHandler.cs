using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.ListUserCryptos;

internal sealed class ListUserCryptosHandler(IUserCryptoRepository userCryptoRepository)
    : IQueryHandler<ListUserCryptosQuery, IReadOnlyList<UserCryptoResponse>>
{
    public async Task<Result<IReadOnlyList<UserCryptoResponse>>> HandleAsync(
        ListUserCryptosQuery query,
        CancellationToken cancellationToken)
    {
        var userCryptos = await userCryptoRepository.ListByUserAsync(query.UserId, cancellationToken);

        return userCryptos.Select(UserCryptoResponse.From).ToList();
    }
}
