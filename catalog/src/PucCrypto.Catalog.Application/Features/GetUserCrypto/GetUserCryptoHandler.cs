using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.GetUserCrypto;

internal sealed class GetUserCryptoHandler(IUserCryptoRepository userCryptoRepository)
    : IQueryHandler<GetUserCryptoQuery, UserCryptoResponse>
{
    public async Task<Result<UserCryptoResponse>> HandleAsync(
        GetUserCryptoQuery query,
        CancellationToken cancellationToken)
    {
        var userCrypto = await userCryptoRepository.GetAsync(query.Id, query.UserId, cancellationToken);

        return userCrypto is null
            ? UserCryptoErrors.NotFound
            : UserCryptoResponse.From(userCrypto);
    }
}
