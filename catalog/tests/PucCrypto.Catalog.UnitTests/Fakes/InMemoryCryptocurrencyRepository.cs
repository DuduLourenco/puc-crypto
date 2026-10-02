using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.UnitTests.Fakes;

internal sealed class InMemoryCryptocurrencyRepository : ICryptocurrencyRepository
{
    public List<Cryptocurrency> Items { get; } = [];

    public int Updates { get; private set; }

    public Task<IReadOnlyList<Cryptocurrency>> ListAsync(CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<Cryptocurrency>>(Items.OrderBy(item => item.Name).ToList());

    public Task<Cryptocurrency?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        Task.FromResult(Items.SingleOrDefault(item => item.Id == id));

    public Task<bool> ExistsByCoinGeckoIdAsync(string coinGeckoId, CancellationToken cancellationToken) =>
        Task.FromResult(Items.Any(item => item.CoinGeckoId == coinGeckoId));

    public Task AddAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken)
    {
        Items.Add(cryptocurrency);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken)
    {
        Updates++;
        return Task.CompletedTask;
    }

    public Task RemoveAsync(Cryptocurrency cryptocurrency, CancellationToken cancellationToken)
    {
        Items.Remove(cryptocurrency);
        return Task.CompletedTask;
    }
}
