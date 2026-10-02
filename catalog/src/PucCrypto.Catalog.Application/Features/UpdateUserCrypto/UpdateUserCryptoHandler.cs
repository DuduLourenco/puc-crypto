using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using PucCrypto.BuildingBlocks.Abstractions.Results;
using PucCrypto.Catalog.Application.Abstractions;
using PucCrypto.Catalog.Application.Common;

namespace PucCrypto.Catalog.Application.Features.UpdateUserCrypto;

internal sealed class UpdateUserCryptoHandler(IUserCryptoRepository userCryptoRepository)
    : ICommandHandler<UpdateUserCryptoCommand, UserCryptoResponse>
{
    public async Task<Result<UserCryptoResponse>> HandleAsync(
        UpdateUserCryptoCommand command,
        CancellationToken cancellationToken)
    {
        var userCrypto = await userCryptoRepository.GetAsync(command.Id, command.UserId, cancellationToken);

        if (userCrypto is null)
        {
            return UserCryptoErrors.NotFound;
        }

        userCrypto.UpdateNotes(command.Notes);

        await userCryptoRepository.UpdateAsync(userCrypto, cancellationToken);

        return UserCryptoResponse.From(userCrypto);
    }
}
