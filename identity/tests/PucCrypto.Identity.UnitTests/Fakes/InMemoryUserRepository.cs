using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.UnitTests.Fakes;

internal sealed class InMemoryUserRepository : IUserRepository
{
    public List<User> Users { get; } = [];

    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        Task.FromResult(Users.SingleOrDefault(user => user.Email == email));

    public Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken) =>
        Task.FromResult(Users.Any(user => user.Email == email));

    public Task AddAsync(User user, CancellationToken cancellationToken)
    {
        Users.Add(user);
        return Task.CompletedTask;
    }
}
