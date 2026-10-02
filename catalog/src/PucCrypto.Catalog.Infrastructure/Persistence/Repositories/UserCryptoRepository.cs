using Microsoft.EntityFrameworkCore;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Repositories;

internal sealed class UserCryptoRepository(CatalogDbContext dbContext) : IUserCryptoRepository
{
    public async Task<IReadOnlyList<UserCrypto>> ListByUserAsync(Guid userId, CancellationToken cancellationToken) =>
        await dbContext.UserCryptos
            .AsNoTracking()
            .Include(userCrypto => userCrypto.Cryptocurrency)
            .Where(userCrypto => userCrypto.UserId == userId)
            .OrderBy(userCrypto => userCrypto.Cryptocurrency.Name)
            .ToListAsync(cancellationToken);

    public Task<UserCrypto?> GetAsync(Guid id, Guid userId, CancellationToken cancellationToken) =>
        dbContext.UserCryptos
            .Include(userCrypto => userCrypto.Cryptocurrency)
            .SingleOrDefaultAsync(userCrypto => userCrypto.Id == id && userCrypto.UserId == userId, cancellationToken);

    public Task<bool> ExistsAsync(Guid userId, Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        dbContext.UserCryptos.AnyAsync(
            userCrypto => userCrypto.UserId == userId && userCrypto.CryptocurrencyId == cryptocurrencyId,
            cancellationToken);

    public Task<bool> AnyByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken) =>
        dbContext.UserCryptos.AnyAsync(userCrypto => userCrypto.CryptocurrencyId == cryptocurrencyId, cancellationToken);

    public async Task AddAsync(UserCrypto userCrypto, CancellationToken cancellationToken)
    {
        dbContext.UserCryptos.Add(userCrypto);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public Task UpdateAsync(UserCrypto userCrypto, CancellationToken cancellationToken) =>
        dbContext.SaveChangesAsync(cancellationToken);

    public async Task RemoveAsync(UserCrypto userCrypto, CancellationToken cancellationToken)
    {
        dbContext.UserCryptos.Remove(userCrypto);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
