using FluentValidation;
using NetArchTest.Rules;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using Xunit;

namespace PucCrypto.ArchitectureTests;

/// <summary>
/// Regras de Clean Architecture e Vertical Slice válidas para qualquer serviço.
/// Cada serviço tem uma classe derivada que informa apenas o seu nome.
/// </summary>
public abstract class ServiceArchitectureTests(string serviceName)
{
    /// <summary>Tecnologias de infraestrutura que não podem aparecer em Domain nem em Application.</summary>
    private static readonly string[] InfrastructureTechnologies =
    [
        "Microsoft.EntityFrameworkCore",
        "Npgsql",
        "RabbitMQ",
        "Azure",
        "BCrypt",
        "Microsoft.IdentityModel"
    ];

    private readonly ServiceAssemblies _service = new(serviceName);

    [Fact]
    public void Domain_NaoDependeDeOutrasCamadasNemDeFrameworks()
    {
        string[] forbidden =
        [
            _service.ApplicationNamespace,
            _service.InfrastructureNamespace,
            _service.ApiNamespace,
            "PucCrypto.BuildingBlocks",
            "PucCrypto.Contracts",
            "Microsoft.AspNetCore",
            "FluentValidation",
            .. InfrastructureTechnologies
        ];

        var result = Types.InAssembly(_service.Domain)
            .ShouldNot().HaveDependencyOnAny(forbidden)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Domain_ReferenciaApenasABibliotecaBaseDoDotNet()
    {
        var references = _service.Domain.GetReferencedAssemblies()
            .Select(reference => reference.Name!)
            .Where(name => !name.StartsWith("System", StringComparison.Ordinal) && name != "netstandard");

        Assert.Empty(references);
    }

    [Fact]
    public void Application_NaoDependeDeInfrastructureNemDeApi()
    {
        var result = Types.InAssembly(_service.Application)
            .ShouldNot().HaveDependencyOnAny(_service.InfrastructureNamespace, _service.ApiNamespace)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Application_NaoDependeDeTecnologiasDeInfraestrutura()
    {
        var result = Types.InAssembly(_service.Application)
            .ShouldNot().HaveDependencyOnAny(InfrastructureTechnologies)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Infrastructure_NaoDependeDeApi()
    {
        var result = Types.InAssembly(_service.Infrastructure)
            .ShouldNot().HaveDependencyOn(_service.ApiNamespace)
            .GetResult();

        AssertSuccessful(result);
    }

    [Fact]
    public void Slices_NaoReferenciamOutrasSlices()
    {
        var slices = SliceNamespaces();

        Assert.NotEmpty(slices);

        foreach (var slice in slices)
        {
            var otherSlices = slices.Where(other => other != slice).ToArray();

            if (otherSlices.Length == 0)
            {
                continue;
            }

            var result = Types.InAssembly(_service.Application)
                .That().ResideInNamespace(slice)
                .ShouldNot().HaveDependencyOnAny(otherSlices)
                .GetResult();

            AssertSuccessful(result);
        }
    }

    [Fact]
    public void Slices_SeguemAConvencaoDeNomes()
    {
        var violations = new List<string>();

        foreach (var type in _service.Application.GetTypes().Where(type => type is { IsClass: true, IsAbstract: false }))
        {
            var expectedSuffix =
                type.IsAssignableTo(typeof(IEndpoint)) ? "Endpoint"
                : type.IsAssignableTo(typeof(IValidator)) ? "Validator"
                : ImplementsHandler(type) ? "Handler"
                : null;

            if (expectedSuffix is null)
            {
                continue;
            }

            var sliceName = type.Namespace?.Split('.').Last();
            var isInsideSlice = type.Namespace?.StartsWith(_service.FeaturesNamespace + ".", StringComparison.Ordinal) == true;

            if (!isInsideSlice || type.Name != sliceName + expectedSuffix)
            {
                violations.Add($"{type.FullName} deveria ser Features.<CasoDeUso>.<CasoDeUso>{expectedSuffix}");
            }
        }

        Assert.Empty(violations);
    }

    private string[] SliceNamespaces() =>
        _service.Application.GetTypes()
            .Select(type => type.Namespace)
            .Where(ns => ns is not null && ns.StartsWith(_service.FeaturesNamespace + ".", StringComparison.Ordinal))
            .Select(ns => string.Join('.', ns!.Split('.').Take(_service.FeaturesNamespace.Split('.').Length + 1)))
            .Distinct()
            .ToArray();

    private static bool ImplementsHandler(Type type) =>
        type.GetInterfaces().Any(contract =>
            contract.IsGenericType &&
            (contract.GetGenericTypeDefinition() == typeof(ICommandHandler<,>) ||
             contract.GetGenericTypeDefinition() == typeof(IQueryHandler<,>)));

    private static void AssertSuccessful(TestResult result) =>
        Assert.True(
            result.IsSuccessful,
            "Tipos que violam a regra: " + string.Join(", ", result.FailingTypeNames ?? []));
}
