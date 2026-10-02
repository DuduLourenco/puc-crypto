using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace PucCrypto.Identity.Infrastructure.Persistence;

public static class MigrationExtensions
{
    /// <summary>Aplica as migrations pendentes no banco do serviço.</summary>
    public static async Task ApplyMigrationsAsync(this IServiceProvider services)
    {
        await using var scope = services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<IdentityDbContext>();

        await dbContext.Database.MigrateAsync();
    }
}
