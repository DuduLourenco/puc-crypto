using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.UnitTests.Fakes;

internal sealed class InMemoryUserCryptoRepository : IUserCryptoRepository
{
    public List<UserCrypto> Items { get; } = [];

    public Task<IReadOnlyList<UserCrypto>> ListByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<UserCrypto>>(Items.Where(item => item.UserId == userId).ToList());

    public Task<UserCrypto?> GetAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
        Task.FromResult(Items.SingleOrDefault(item => item.Id == id && item.UserId == userId));

    public Task<bool> ExistsAsync(Guid userId, Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        Task.FromResult(Items.Any(item => item.UserId == userId && item.CryptocurrencyId == cryptocurrencyId));

    public Task<bool> AnyByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        Task.FromResult(Items.Any(item => item.CryptocurrencyId == cryptocurrencyId));

    public Task AddAsync(UserCrypto userCrypto, CancellationToken cancellationToken)
    {
        Items.Add(userCrypto);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(UserCrypto userCrypto, CancellationToken cancellationToken) => Task.CompletedTask;

    public Task RemoveAsync(UserCrypto userCrypto, CancellationToken cancellationToken)
    {
        Items.Remove(userCrypto);
        return Task.CompletedTask;
    }
}
