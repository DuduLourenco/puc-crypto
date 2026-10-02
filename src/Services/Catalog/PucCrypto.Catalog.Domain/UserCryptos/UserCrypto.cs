using PucCrypto.Catalog.Domain.Cryptocurrencies;

namespace PucCrypto.Catalog.Domain.UserCryptos;

/// <summary>Criptomoeda monitorada por um usuário.</summary>
public sealed class UserCrypto
{
    public const int NotesMaxLength = 500;

    private UserCrypto(Guid id, Guid userId, Guid cryptocurrencyId, string? notes, DateTime addedAt)
    {
        Id = id;
        UserId = userId;
        CryptocurrencyId = cryptocurrencyId;
        Notes = notes;
        AddedAt = addedAt;
    }

    public Guid Id { get; private set; }

    /// <summary>Id do usuário no serviço Identity. Não há chave estrangeira: o usuário vive em outro banco.</summary>
    public Guid UserId { get; private set; }

    public Guid CryptocurrencyId { get; private set; }

    public Cryptocurrency Cryptocurrency { get; private set; } = null!;

    public string? Notes { get; private set; }

    public DateTime AddedAt { get; private set; }

    public static UserCrypto Create(Guid userId, Cryptocurrency cryptocurrency, string? notes, DateTime addedAt) =>
        new(Guid.NewGuid(), userId, cryptocurrency.Id, NormalizeNotes(notes), addedAt)
        {
            Cryptocurrency = cryptocurrency
        };

    public void UpdateNotes(string? notes) => Notes = NormalizeNotes(notes);

    private static string? NormalizeNotes(string? notes) => string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
}
