using Microsoft.EntityFrameworkCore;
using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Infrastructure.Persistence.Repositories;

internal sealed class UserRepository(IdentityDbContext dbContext) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Users.AsNoTracking().SingleOrDefaultAsync(user => user.Email == email, cancellationToken);

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken) =>
        dbContext.Users.AnyAsync(user => user.Email == email, cancellationToken);

    public async Task AddAsync(User user, CancellationToken cancellationToken)
    {
        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
