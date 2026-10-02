using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.BuildingBlocks.Abstractions.Handlers;

/// <summary>Caso de uso que altera o estado do serviço.</summary>
public interface ICommandHandler<in TCommand, TResponse>
{
    Task<Result<TResponse>> HandleAsync(TCommand command, CancellationToken cancellationToken);
}
