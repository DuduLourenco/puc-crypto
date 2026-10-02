using Microsoft.EntityFrameworkCore;
using PucCrypto.Catalog.Domain.Cryptocurrencies;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Infrastructure.Persistence;

public sealed class CatalogDbContext(DbContextOptions<CatalogDbContext> options) : DbContext(options)
{
    public DbSet<Cryptocurrency> Cryptocurrencies => Set<Cryptocurrency>();

    public DbSet<UserCrypto> UserCryptos => Set<UserCrypto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) =>
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CatalogDbContext).Assembly);
}
