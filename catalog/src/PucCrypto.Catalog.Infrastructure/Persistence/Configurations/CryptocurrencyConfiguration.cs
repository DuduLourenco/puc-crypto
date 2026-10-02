using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Configurations;

internal sealed class CryptocurrencyConfiguration : IEntityTypeConfiguration<Cryptocurrency>
{
    public void Configure(EntityTypeBuilder<Cryptocurrency> builder)
    {
        builder.ToTable("cryptocurrencies");

        builder.HasKey(cryptocurrency => cryptocurrency.Id);

        builder.Property(cryptocurrency => cryptocurrency.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(cryptocurrency => cryptocurrency.Symbol).HasColumnName("symbol").HasMaxLength(Cryptocurrency.SymbolMaxLength);
        builder.Property(cryptocurrency => cryptocurrency.Name).HasColumnName("name").HasMaxLength(Cryptocurrency.NameMaxLength);
        builder.Property(cryptocurrency => cryptocurrency.CoinGeckoId).HasColumnName("coingecko_id").HasMaxLength(Cryptocurrency.CoinGeckoIdMaxLength);
        builder.Property(cryptocurrency => cryptocurrency.CreatedAt).HasColumnName("created_at")
            .HasConversion(UtcDateTimeConverter.Instance);

        builder.HasIndex(cryptocurrency => cryptocurrency.CoinGeckoId).IsUnique();
    }
}
