using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Application.Abstractions;

public interface ICryptocurrencyRepository
{
    Task<Cryptocurrency?> GetByCoinGeckoIdAsync(string coinGeckoId, CancellationToken cancellationToken);
}
