using PucCrypto.MarketData.Domain.PricePoints;

namespace PucCrypto.MarketData.Application.Abstractions;

public interface IPricePointRepository
{
    Task<PricePoint?> GetAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>Preços de uma criptomoeda no intervalo, do mais antigo ao mais recente.</summary>
    Task<IReadOnlyList<PricePoint>> ListAsync(
        Guid cryptocurrencyId,
        DateTime? from,
        DateTime? to,
        int limit,
        CancellationToken cancellationToken);

    Task<bool> ExistsAsync(Guid cryptocurrencyId, DateTime timestamp, CancellationToken cancellationToken);

    Task AddAsync(PricePoint pricePoint, CancellationToken cancellationToken);

    /// <summary>Grava os preços coletados; um preço já existente para o mesmo instante é atualizado.</summary>
    Task UpsertManyAsync(IReadOnlyCollection<PricePoint> pricePoints, CancellationToken cancellationToken);

    Task UpdateAsync(PricePoint pricePoint, CancellationToken cancellationToken);

    Task DeleteAsync(Guid id, CancellationToken cancellationToken);

    Task DeleteByCryptocurrencyAsync(Guid cryptocurrencyId, CancellationToken cancellationToken);
}
