using NetArchTest.Rules;
using Xunit;

namespace PucCrypto.Forecast.ArchitectureTests;

/// <summary>Clean Architecture: as dependências apontam para dentro.</summary>
public sealed class LayerDependencyTests
{
    [Fact]
    public void Domain_NaoDependeDeOutrasCamadasNemDeFrameworks()
    {
        string[] forbidden =
        [
            Layers.ApplicationNamespace,
            Layers.InfrastructureNamespace,
            Layers.ApiNamespace,
            "PucCrypto.BuildingBlocks",
            "Microsoft.AspNetCore",
            "FluentValidation",
            .. Layers.InfrastructureTechnologies
        ];

        var result = Types.InAssembly(Layers.Domain)
            .ShouldNot().HaveDependencyOnAny(forbidden)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Domain_ReferenciaApenasABibliotecaBaseDoDotNet()
    {
        var references = Layers.Domain.GetReferencedAssemblies()
            .Select(reference => reference.Name!)
            .Where(name => !name.StartsWith("System", StringComparison.Ordinal) && name != "netstandard");

        Assert.Empty(references);
    }

    [Fact]
    public void Application_NaoDependeDeInfrastructureNemDeApi()
    {
        var result = Types.InAssembly(Layers.Application)
            .ShouldNot().HaveDependencyOnAny(Layers.InfrastructureNamespace, Layers.ApiNamespace)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Application_NaoDependeDeTecnologiasDeInfraestrutura()
    {
        var result = Types.InAssembly(Layers.Application)
            .ShouldNot().HaveDependencyOnAny(Layers.InfrastructureTechnologies)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Infrastructure_NaoDependeDeApi()
    {
        var result = Types.InAssembly(Layers.Infrastructure)
            .ShouldNot().HaveDependencyOn(Layers.ApiNamespace)
            .GetResult();

        AssertSuccessful(result);
    }

    private static void AssertSuccessful(TestResult result) =>
        Assert.True(
            result.IsSuccessful,
            "Tipos que violam a regra: " + string.Join(", ", result.FailingTypeNames ?? []));
}
