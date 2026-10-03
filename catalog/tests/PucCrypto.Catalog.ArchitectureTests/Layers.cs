using System.Reflection;

namespace PucCrypto.Catalog.ArchitectureTests;

/// <summary>Namespaces e assemblies das camadas do serviço.</summary>
internal static class Layers
{
    public const string DomainNamespace = "PucCrypto.Catalog.Domain";
    public const string ApplicationNamespace = "PucCrypto.Catalog.Application";
    public const string InfrastructureNamespace = "PucCrypto.Catalog.Infrastructure";
    public const string ApiNamespace = "PucCrypto.Catalog.Api";
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
        "Microsoft.IdentityModel",
        "Microsoft.ML",
        "Microsoft.Azure.Functions"
    ];

    public static Assembly Domain => Assembly.Load(DomainNamespace);

    public static Assembly Application => Assembly.Load(ApplicationNamespace);

    public static Assembly Infrastructure => Assembly.Load(InfrastructureNamespace);
}
