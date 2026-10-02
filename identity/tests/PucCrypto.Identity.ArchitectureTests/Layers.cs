using System.Reflection;

namespace PucCrypto.Identity.ArchitectureTests;

/// <summary>Namespaces e assemblies das camadas do serviço.</summary>
internal static class Layers
{
    public const string DomainNamespace = "PucCrypto.Identity.Domain";
    public const string ApplicationNamespace = "PucCrypto.Identity.Application";
    public const string InfrastructureNamespace = "PucCrypto.Identity.Infrastructure";
    public const string ApiNamespace = "PucCrypto.Identity.Api";
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
        "Microsoft.IdentityModel"
    ];

    public static Assembly Domain => Assembly.Load(DomainNamespace);

    public static Assembly Application => Assembly.Load(ApplicationNamespace);

    public static Assembly Infrastructure => Assembly.Load(InfrastructureNamespace);
}
