using System.Text.RegularExpressions;
using Assembly = System.Reflection.Assembly;
using ArchUnitNET.Domain;
using ArchUnitNET.Loader;
using FluentValidation;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace PucCrypto.Forecast.ArchitectureTests;

/// <summary>Namespaces, assemblies e camadas do serviço carregados pelo ArchUnitNET.</summary>
internal static class Layers
{
    public const string DomainNamespace = "PucCrypto.Forecast.Domain";
    public const string ApplicationNamespace = "PucCrypto.Forecast.Application";
    public const string InfrastructureNamespace = "PucCrypto.Forecast.Infrastructure";
    public const string ApiNamespace = "PucCrypto.Forecast.Api";
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

    public static Assembly Api => Assembly.Load(ApiNamespace);

    /// <summary>Camadas do serviço mais os assemblies dos contratos usados nas convenções das slices.</summary>
    public static readonly Architecture Architecture =
        new ArchLoader()
            .LoadAssemblies(Domain, Application, Infrastructure, Api, typeof(IEndpoint).Assembly, typeof(IValidator).Assembly)
            .Build();

    public static readonly IObjectProvider<IType> DomainLayer =
        Types().That().ResideInAssembly(Domain).As("Domain");

    public static readonly IObjectProvider<IType> ApplicationLayer =
        Types().That().ResideInAssembly(Application).As("Application");

    public static readonly IObjectProvider<IType> InfrastructureLayer =
        Types().That().ResideInAssembly(Infrastructure).As("Infrastructure");

    /// <summary>Regex que casa com qualquer um dos namespaces informados ou com seus sub-namespaces.</summary>
    public static string AnyNamespaceOf(params string[] namespaces) =>
        "^(" + string.Join('|', namespaces.Select(Regex.Escape)) + @")(\..+)?$";
}
