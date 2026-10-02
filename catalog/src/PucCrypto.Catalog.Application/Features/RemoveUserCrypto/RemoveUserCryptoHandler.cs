using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.RemoveUserCrypto;

internal sealed class RemoveUserCryptoHandler(IUserCryptoRepository userCryptoRepository)
    : ICommandHandler<RemoveUserCryptoCommand>
{
    public async Task<Result> HandleAsync(RemoveUserCryptoCommand command, CancellationToken cancellationToken)
    {
        var userCrypto = await userCryptoRepository.GetAsync(command.Id, command.UserId, cancellationToken);

        if (userCrypto is null)
        {
            return UserCryptoErrors.NotFound;
        }

        // A criptomoeda permanece no catálogo: só o item da lista do usuário é removido.
        await userCryptoRepository.RemoveAsync(userCrypto, cancellationToken);

        return Result.Success();
    }
}
