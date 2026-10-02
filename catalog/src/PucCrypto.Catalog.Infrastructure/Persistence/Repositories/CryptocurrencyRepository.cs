using Microsoft.EntityFrameworkCore;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Repositories;

internal sealed class CryptocurrencyRepository(CatalogDbContext dbContext) : ICryptocurrencyRepository
{
    public async Task<IReadOnlyList<Cryptocurrency>> ListAsync(CancellationToken cancellationToken) =>
        await dbContext.Cryptocurrencies
            .AsNoTracking()
            .OrderBy(cryptocurrency => cryptocurrency.Name)
            .ToListAsync(cancellationToken);

    public Task<Cryptocurrency?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        dbContext.Cryptocurrencies.SingleOrDefaultAsync(cryptocurrency => cryptocurrency.Id == id, cancellationToken);

    public Task<bool> ExistsByCoinGeckoIdAsync(string coinGeckoId, CancellationToken cancellationToken) =>
        dbContext.Cryptocurrencies.AnyAsync(cryptocurrency => cryptocurrency.CoinGeckoId == coinGeckoId, cancellationToken);

    public async Task AddAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken)
    {
        dbContext.Cryptocurrencies.Add(cryptocurrency);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task UpdateAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    public async Task RemoveAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken)
    {
        dbContext.Cryptocurrencies.Remove(cryptocurrency);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
