using ArchUnitNET.xUnit;
using Xunit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace PucCrypto.Identity.ArchitectureTests;

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

        Types().That().Are(Layers.DomainLayer)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceMatching(Layers.AnyNamespaceOf(forbidden))
            .Because("o Domain é o núcleo e não conhece camadas externas nem frameworks")
            .Check(Layers.Architecture);
    }

    [Fact]
    public void Domain_DependeApenasDeSiMesmoEDaBibliotecaBaseDoDotNet()
    {
        Types().That().Are(Layers.DomainLayer)
            .Should().OnlyDependOnTypesThat().ResideInNamespaceMatching(Layers.AnyNamespaceOf(Layers.DomainNamespace, "System"))
            .Because("o Domain é C# puro")
            .Check(Layers.Architecture);
    }

    [Fact]
    public void Application_NaoDependeDeInfrastructureNemDeApi()
    {
        Types().That().Are(Layers.ApplicationLayer)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceMatching(
                Layers.AnyNamespaceOf(Layers.InfrastructureNamespace, Layers.ApiNamespace))
            .Because("a Application define portas e a Infrastructure as implementa")
            .Check(Layers.Architecture);
    }

    [Fact]
    public void Application_NaoDependeDeTecnologiasDeInfraestrutura()
    {
        Types().That().Are(Layers.ApplicationLayer)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceMatching(
                Layers.AnyNamespaceOf(Layers.InfrastructureTechnologies))
            .Because("bancos, mensageria e SDKs de nuvem ficam na Infrastructure")
            .Check(Layers.Architecture);
    }

    [Fact]
    public void Infrastructure_NaoDependeDeApi()
    {
        Types().That().Are(Layers.InfrastructureLayer)
            .Should().NotDependOnAnyTypesThat().ResideInNamespaceMatching(Layers.AnyNamespaceOf(Layers.ApiNamespace))
            .Because("os adaptadores não conhecem a camada de entrada HTTP")
            .Check(Layers.Architecture);
    }
}
