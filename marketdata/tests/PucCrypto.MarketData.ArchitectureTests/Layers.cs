using System.Reflection;

namespace PucCrypto.MarketData.ArchitectureTests;

/// <summary>Namespaces e assemblies das camadas do serviço.</summary>
internal static class Layers
{
    public const string DomainNamespace = "PucCrypto.MarketData.Domain";
    public const string ApplicationNamespace = "PucCrypto.MarketData.Application";
    public const string InfrastructureNamespace = "PucCrypto.MarketData.Infrastructure";
    public const string ApiNamespace = "PucCrypto.MarketData.Api";
    public const string FeaturesNamespace = ApplicationNamespace + ".Features";

    /// <summary>Tecnologias de infraestrutura que não podem aparecer em Domain nem em Application.</summary>
    public static readonly string[] InfrastructureTechnologies =
    [
        "Microsoft.EntityFrameworkCore",
        "Microsoft.Data.SqlClient",
        "Npgsql",
        "MongoDB",
        "RabbitMQ",
        "Azure",
        "BCrypt",
        "Microsoft.MarketDataModel"
    ];

    public static Assembly Domain => Assembly.Load(DomainNamespace);

    public static Assembly Application => Assembly.Load(ApplicationNamespace);

    public static Assembly Infrastructure => Assembly.Load(InfrastructureNamespace);
}
