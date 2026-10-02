using FluentValidation;
using NetArchTest.Rules;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using Xunit;

namespace PucCrypto.MarketData.ArchitectureTests;

/// <summary>Vertical Slice: cada caso de uso é uma pasta independente em Application/Features.</summary>
public sealed class SliceTests
{
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

            var result = Types.InAssembly(Layers.Application)
                .That().ResideInNamespace(slice)
                .ShouldNot().HaveDependencyOnAny(otherSlices)
                .GetResult();

            Assert.True(
                result.IsSuccessful,
                "Tipos que violam a regra: " + string.Join(", ", result.FailingTypeNames ?? []));
        }
    }

    [Fact]
    public void Slices_SeguemAConvencaoDeNomes()
    {
        var violations = new List<string>();

        foreach (var type in Layers.Application.GetTypes().Where(type => type is { IsClass: true, IsAbstract: false }))
        {
            var expectedSuffix =
                type.IsAssignableTo(typeof(IEndpoint)) ? "Endpoint"
                : type.IsAssignableTo(typeof(IValidator)) ? "Validator"
                : ImplementsHandler(type) ? "Handler"
                : ImplementsConsumer(type) ? "Consumer"
                : null;

            if (expectedSuffix is null)
            {
                continue;
            }

            var sliceName = type.Namespace?.Split('.').Last();
            var isInsideSlice = type.Namespace?.StartsWith(Layers.FeaturesNamespace + ".", StringComparison.Ordinal) == true;

            if (!isInsideSlice || type.Name != sliceName + expectedSuffix)
            {
                violations.Add($"{type.FullName} deveria ser Features.<CasoDeUso>.<CasoDeUso>{expectedSuffix}");
            }
        }

        Assert.Empty(violations);
    }

    private static string[] SliceNamespaces() =>
        Layers.Application.GetTypes()
            .Select(type => type.Namespace)
            .Where(ns => ns is not null && ns.StartsWith(Layers.FeaturesNamespace + ".", StringComparison.Ordinal))
            .Select(ns => string.Join('.', ns!.Split('.').Take(Layers.FeaturesNamespace.Split('.').Length + 1)))
            .Distinct()
            .ToArray();

    private static bool ImplementsConsumer(Type type) =>
        type.GetInterfaces().Any(contract =>
            contract.IsGenericType && contract.GetGenericTypeDefinition() == typeof(IEventConsumer<>));

    private static bool ImplementsHandler(Type type) =>
        type.GetInterfaces().Any(contract =>
            contract.IsGenericType &&
            (contract.GetGenericTypeDefinition() == typeof(ICommandHandler<,>) ||
             contract.GetGenericTypeDefinition() == typeof(ICommandHandler<>) ||
             contract.GetGenericTypeDefinition() == typeof(IQueryHandler<,>)));
}
