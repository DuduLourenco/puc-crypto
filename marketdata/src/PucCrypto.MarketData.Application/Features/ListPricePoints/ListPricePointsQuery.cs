namespace PucCrypto.MarketData.Application.Features.ListPricePoints;

/// <summary>Parâmetros da query string. Sem intervalo, devolve todo o histórico (até o limite).</summary>
public sealed record ListPricePointsQuery(Guid CryptocurrencyId, DateTime? From, DateTime? To, int? Limit);
