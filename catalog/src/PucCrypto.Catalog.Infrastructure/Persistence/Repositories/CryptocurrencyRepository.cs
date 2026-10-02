using Microsoft.EntityFrameworkCore;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Repositories;

internal sealed class CryptocurrencyRepository(CatalogDbContext dbContext) : ICryptocurrencyRepository
{
    public Task<Cryptocurrency?> GetByCoinGeckoIdAsync(string coinGeckoId, CancellationToken cancellationToken) =>
        dbContext.Cryptocurrencies.SingleOrDefaultAsync(
            cryptocurrency => cryptocurrency.CoinGeckoId == coinGeckoId,
            cancellationToken);
}
