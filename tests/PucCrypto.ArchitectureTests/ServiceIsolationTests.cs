using NetArchTest.Rules;
using Xunit;

namespace PucCrypto.ArchitectureTests;

/// <summary>Um serviço não pode referenciar código de outro serviço.</summary>
public sealed class ServiceIsolationTests
{
    public static TheoryData<string> Services => new(ServiceAssemblies.AllServices);

    [Theory]
    [MemberData(nameof(Services))]
    public void Servico_NaoDependeDeTiposDeOutrosServicos(string serviceName)
    {
        var service = new ServiceAssemblies(serviceName);
        var otherServices = OtherServiceNamespaces(serviceName);

        var result = Types.InAssemblies(service.All)
            .ShouldNot().HaveDependencyOnAny(otherServices)
            .GetResult();

        Assert.True(
            result.IsSuccessful,
            "Tipos que violam a regra: " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Theory]
    [MemberData(nameof(Services))]
    public void Servico_NaoReferenciaAssembliesDeOutrosServicos(string serviceName)
    {
        var service = new ServiceAssemblies(serviceName);
        var otherServices = OtherServiceNamespaces(serviceName);

        var references = service.All
            .SelectMany(assembly => assembly.GetReferencedAssemblies())
            .Select(reference => reference.Name!)
            .Where(name => otherServices.Any(other => name.StartsWith(other + ".", StringComparison.Ordinal)));

        Assert.Empty(references);
    }

    private static string[] OtherServiceNamespaces(string serviceName) =>
        ServiceAssemblies.AllServices
            .Where(other => other != serviceName)
            .Select(other => new ServiceAssemblies(other).RootNamespace)
            .ToArray();
}
