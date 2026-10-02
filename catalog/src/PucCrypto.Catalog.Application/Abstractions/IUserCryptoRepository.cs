using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Abstractions;

public interface IUserCryptoRepository
{
    Task<IReadOnlyList<UserCrypto>> ListByUserAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>Devolve o item apenas se ele pertencer ao usuário informado.</summary>
    Task<UserCrypto?> GetAsync(Guid id, Guid userId, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid userId, Guid cryptocurrencyId, CancellationToken cancellationToken);

    /// <summary>Indica se a criptomoeda está na lista de algum usuário.</summary>
    Task<bool> AnyByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken);

    Task AddAsync(UserCrypto userCrypto, CancellationToken cancellationToken);

    Task UpdateAsync(UserCrypto userCrypto, CancellationToken cancellationToken);

    Task RemoveAsync(UserCrypto userCrypto, CancellationToken cancellationToken);
}
