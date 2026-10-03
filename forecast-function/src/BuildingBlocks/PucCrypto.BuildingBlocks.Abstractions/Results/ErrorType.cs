namespace PucCrypto.BuildingBlocks.Abstractions.Results;

public enum ErrorType
{
    Validation,
    Unauthorized,
    NotFound,
    Conflict,

    /// <summary>Uma dependência externa (ex.: API de preços) não respondeu.</summary>
    Unavailable
}
