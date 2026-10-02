using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.GetCrypto;

internal sealed class GetCryptoHandler(ICryptocurrencyRepository cryptocurrencyRepository)
    : IQueryHandler<GetCryptoQuery, CryptoResponse>
{
    public async Task<Result<CryptoResponse>> HandleAsync(GetCryptoQuery query, CancellationToken cancellationToken)
    {
        var cryptocurrency = await cryptocurrencyRepository.GetByIdAsync(query.Id, cancellationToken);

        return cryptocurrency is null
            ? CryptoErrors.NotFound
            : CryptoResponse.From(cryptocurrency);
    }
}
