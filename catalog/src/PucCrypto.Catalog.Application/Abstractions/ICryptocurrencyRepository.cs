using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Abstractions;

public interface ICryptocurrencyRepository
{
    Task<IReadOnlyList<Cryptocurrency>> ListAsync(CancellationToken cancellationToken);

    Task<Cryptocurrency?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> ExistsByCoinGeckoIdAsync(string coinGeckoId, CancellationToken cancellationToken);

    Task AddAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken);

    Task UpdateAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken);

    Task RemoveAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken);
}
