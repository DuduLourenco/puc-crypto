using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PucCrypto.Identity.Domain.Users;

namespace PucCrypto.Identity.Infrastructure.Persistence.Configurations;

internal sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");

        builder.HasKey(user => user.Id);

        builder.Property(user => user.Id).HasColumnName("id").ValueGeneratedNever();
        builder.Property(user => user.Name).HasColumnName("name").HasMaxLength(User.NameMaxLength);
        builder.Property(user => user.Email).HasColumnName("email").HasMaxLength(User.EmailMaxLength);
        builder.Property(user => user.PasswordHash).HasColumnName("password_hash");
        builder.Property(user => user.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(user => user.Email).IsUnique();
    }
}
