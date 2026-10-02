using System.Reflection;

namespace PucCrypto.ArchitectureTests;

/// <summary>Assemblies e namespaces das camadas de um serviço (ex.: "Identity").</summary>
internal sealed class ServiceAssemblies(string serviceName)
{
    public static readonly string[] AllServices = ["Identity", "Catalog", "MarketData", "Prediction"];

    public string Name { get; } = serviceName;

    public string RootNamespace => $"PucCrypto.{Name}";

    public string DomainNamespace => $"{RootNamespace}.Domain";

    public string ApplicationNamespace => $"{RootNamespace}.Application";

    public string InfrastructureNamespace => $"{RootNamespace}.Infrastructure";

    public string ApiNamespace => $"{RootNamespace}.Api";

    public string FeaturesNamespace => $"{ApplicationNamespace}.Features";

    public Assembly Domain => Assembly.Load(DomainNamespace);

    public Assembly Application => Assembly.Load(ApplicationNamespace);

    public Assembly Infrastructure => Assembly.Load(InfrastructureNamespace);

    public Assembly Api => Assembly.Load(ApiNamespace);

    public Assembly[] All => [Domain, Application, Infrastructure, Api];
}
