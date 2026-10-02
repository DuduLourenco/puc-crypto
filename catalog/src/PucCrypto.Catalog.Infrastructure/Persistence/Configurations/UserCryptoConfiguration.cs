using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PucCrypto.Catalog.Domain.UserCryptos;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Configurations;

internal sealed class UserCryptoConfiguration : IEntityTypeConfiguration<UserCrypto>
{
    public void Configure(EntityTypeBuilder<UserCrypto> builder)
    {
        builder.ToTable("user_cryptos");

        builder.HasKey(userCrypto => userCrypto.Id);

        builder.Property(userCrypto => userCrypto.Id).HasColumnName("id").ValueGeneratedNever();

        // user_id referencia o usuário do serviço Identity, que fica em outro banco: não há FK.
        builder.Property(userCrypto => userCrypto.UserId).HasColumnName("user_id");
        builder.Property(userCrypto => userCrypto.CryptocurrencyId).HasColumnName("cryptocurrency_id");
        builder.Property(userCrypto => userCrypto.Notes).HasColumnName("notes").HasMaxLength(UserCrypto.NotesMaxLength);
        builder.Property(userCrypto => userCrypto.AddedAt).HasColumnName("added_at")
            .HasConversion(UtcDateTimeConverter.Instance);

        builder.HasOne(userCrypto => userCrypto.Cryptocurrency)
            .WithMany()
            .HasForeignKey(userCrypto => userCrypto.CryptocurrencyId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(userCrypto => new { userCrypto.UserId, userCrypto.CryptocurrencyId }).IsUnique();
    }
}
