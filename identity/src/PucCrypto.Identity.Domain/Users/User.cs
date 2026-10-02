namespace PucCrypto.Identity.Domain.Users;

public sealed class User
{
    public const int NameMaxLength = 100;
    public const int EmailMaxLength = 254;

    private User(Guid id, string name, string email, string passwordHash, DateTime createdAt)
    {
        Id = id;
        Name = name;
        Email = email;
        PasswordHash = passwordHash;
        CreatedAt = createdAt;
    }

    public Guid Id { get; private set; }

    public string Name { get; private set; }

    public string Email { get; private set; }

    public string PasswordHash { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public static User Create(string name, string email, string passwordHash, DateTime createdAt) =>
        new(Guid.NewGuid(), name.Trim(), NormalizeEmail(email), passwordHash, createdAt);

    /// <summary>O e-mail identifica o usuário sem diferenciar maiúsculas de minúsculas.</summary>
    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();
}
