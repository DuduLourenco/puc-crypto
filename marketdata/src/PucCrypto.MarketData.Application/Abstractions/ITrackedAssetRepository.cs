using PucCrypto.MarketData.Domain.TrackedAssets;

namespace PucCrypto.MarketData.Application.Abstractions;

public interface ITrackedAssetRepository
{
    Task<IReadOnlyList<TrackedAsset>> ListAsync(CancellationToken cancellationToken);

    Task<TrackedAsset?> GetAsync(Guid cryptocurrencyId, CancellationToken cancellationToken);

    /// <summary>Grava ou substitui o ativo; repetir o mesmo evento não duplica dados.</summary>
    Task UpsertAsync(TrackedAsset asset, CancellationToken cancellationToken);

    Task DeleteAsync(Guid cryptocurrencyId, CancellationToken cancellationToken);
}
