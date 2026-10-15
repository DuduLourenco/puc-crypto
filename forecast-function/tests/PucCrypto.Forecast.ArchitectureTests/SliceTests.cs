using System.Text.RegularExpressions;
using ArchUnitNET.Domain;
using ArchUnitNET.Fluent;
using ArchUnitNET.Fluent.Conditions;
using ArchUnitNET.xUnit;
using FluentValidation;
using PucCrypto.BuildingBlocks.Abstractions.Endpoints;
using PucCrypto.BuildingBlocks.Abstractions.Events;
using PucCrypto.BuildingBlocks.Abstractions.Handlers;
using Xunit;
using static ArchUnitNET.Fluent.ArchRuleDefinition;

namespace PucCrypto.Forecast.ArchitectureTests;

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

            Types().That().ResideInNamespaceMatching(Layers.AnyNamespaceOf(slice))
                .Should().NotDependOnAnyTypesThat().ResideInNamespaceMatching(Layers.AnyNamespaceOf(otherSlices))
                .Because($"a slice {slice.Split('.').Last()} é independente das demais")
                .Check(Layers.Architecture);
        }
    }

    [Theory]
    [InlineData(typeof(IEndpoint), "Endpoint")]
    [InlineData(typeof(IValidator), "Validator")]
    [InlineData(typeof(ICommandHandler<,>), "Handler")]
    [InlineData(typeof(ICommandHandler<>), "Handler")]
    [InlineData(typeof(IQueryHandler<,>), "Handler")]
    [InlineData(typeof(IEventConsumer<>), "Consumer")]
    public void Slices_SeguemAConvencaoDeNomes(Type contract, string suffix)
    {
        Classes().That().AreNotAbstract().And().ResideInAssembly(Layers.Application).And().AreAssignableTo(contract)
            .Should().ResideInNamespaceMatching($@"^{Regex.Escape(Layers.FeaturesNamespace)}\.[^.]+$")
            .AndShould().FollowCustomCondition(
                type => NamedAfterSlice(type, suffix),
                $"se chamar <CasoDeUso>{suffix}")
            .WithoutRequiringPositiveResults()
            .Check(Layers.Architecture);
    }

    private static ConditionResult NamedAfterSlice(IType type, string suffix)
    {
        var expectedName = type.Namespace.Name.Split('.').Last() + suffix;

        return type.Name == expectedName
            ? new ConditionResult(type, true)
            : new ConditionResult(type, false, $"deveria se chamar {expectedName}");
    }

    private static string[] SliceNamespaces() =>
        Layers.Application.GetTypes()
            .Select(type => type.Namespace)
            .Where(ns => ns is not null && ns.StartsWith(Layers.FeaturesNamespace + ".", StringComparison.Ordinal))
            .Select(ns => string.Join('.', ns!.Split('.').Take(Layers.FeaturesNamespace.Split('.').Length + 1)))
            .Distinct()
            .ToArray();
}
