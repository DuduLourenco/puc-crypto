using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace PucCrypto.Catalog.Infrastructure.Persistence.Configurations;

/// <summary>
/// O SQL Server não guarda o fuso de um datetime2. Todas as datas são gravadas
/// em UTC, e este conversor as marca como UTC ao serem lidas.
/// </summary>
internal sealed class UtcDateTimeConverter() : ValueConverter<DateTime, DateTime>(
    value => value,
    value => DateTime.SpecifyKind(value, DateTimeKind.Utc))
{
    public static readonly UtcDateTimeConverter Instance = new();
}
