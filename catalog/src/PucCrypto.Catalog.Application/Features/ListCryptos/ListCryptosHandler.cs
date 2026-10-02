using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.ListCryptos;

internal sealed class ListCryptosHandler(ICryptocurrencyRepository cryptocurrencyRepository)
    : IQueryHandler<ListCryptosQuery, IReadOnlyList<CryptoResponse>>
{
    public async Task<Result<IReadOnlyList<CryptoResponse>>> HandleAsync(
        ListCryptosQuery query,
        CancellationToken cancellationToken)
    {
        var cryptocurrencies = await cryptocurrencyRepository.ListAsync(cancellationToken);

        return cryptocurrencies.Select(CryptoResponse.From).ToList();
    }
}
