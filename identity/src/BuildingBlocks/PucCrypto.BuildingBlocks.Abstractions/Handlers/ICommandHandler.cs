using PucCrypto.BuildingBlocks.Abstractions.Results;

namespace PucCrypto.BuildingBlocks.Abstractions.Handlers;

/// <summary>Caso de uso que altera o estado do serviço e devolve um valor.</summary>
public interface ICommandHandler<in TCommand, TResponse>
{
    Task<Result<TResponse>> HandleAsync(TCommand command, CancellationToken cancellationToken);
}

/// <summary>Caso de uso que altera o estado do serviço e não devolve valor.</summary>
public interface ICommandHandler<in TCommand>
{
    Task<Result> HandleAsync(TCommand command, CancellationToken cancellationToken);
}
