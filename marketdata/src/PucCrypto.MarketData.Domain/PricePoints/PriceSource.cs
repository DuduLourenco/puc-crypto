namespace PucCrypto.MarketData.Domain.PricePoints;

public enum PriceSource
{
    /// <summary>Coletado da API CoinGecko.</summary>
    CoinGecko,

    /// <summary>Cadastrado pelo CRUD.</summary>
    Manual
}
