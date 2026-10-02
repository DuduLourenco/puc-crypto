using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.BuildingBlocks.Abstractions.Handlers;

/// <summary>Caso de uso que apenas lê o estado do serviço.</summary>
public interface IQueryHandler<in TQuery, TResponse>
{
    Task<Result<TResponse>> HandleAsync(TQuery query, CancellationToken cancellationToken);
}
