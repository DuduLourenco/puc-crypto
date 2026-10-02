using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Application.Abstractions;

/// <summary>Todas as consultas são restritas ao usuário informado.</summary>
public interface IUserCryptoRepository
{
    Task<IReadOnlyList<UserCrypto>> ListByUserAsync(Guid userId, CancellationToken cancellationToken);

    Task<UserCrypto?> GetAsync(Guid id, Guid userId, CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid userId, Guid cryptocurrencyId, CancellationToken cancellationToken);

    /// <summary>Grava o item e, se ainda não existir, a criptomoeda associada, na mesma transação.</summary>
    Task AddAsync(UserCrypto userCrypto, CancellationToken cancellationToken);

    Task UpdateAsync(UserCrypto userCrypto, CancellationToken cancellationToken);

    Task RemoveAsync(UserCrypto userCrypto, CancellationToken cancellationToken);
}
