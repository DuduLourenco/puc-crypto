using FluentValidation;
using PucCrypto.Forecast.Domain.Forecasting;

namespace PucCrypto.Forecast.Application.Features.GetForecast;

internal sealed class GetForecastValidator : AbstractValidator<GetForecastQuery>
{
    public GetForecastValidator()
    {
        RuleFor(query => query.Prices).NotNull();

        When(query => query.Prices is not null, () =>
        {
            RuleFor(query => query.Prices!.Select(price => price.Timestamp).Distinct().Count())
                .InclusiveBetween(PriceSeries.MinimumLength, PriceSeries.MaximumLength)
                .OverridePropertyName("Prices")
                .WithMessage($"A série precisa ter entre {PriceSeries.MinimumLength} e {PriceSeries.MaximumLength} instantes distintos.");

            RuleForEach(query => query.Prices).ChildRules(price =>
            {
                price.RuleFor(item => item.Timestamp).NotEmpty();
                price.RuleFor(item => item.PriceUsd).GreaterThan(0);
            });
        });

        RuleFor(query => query.Horizon).InclusiveBetween(1, GetForecastQuery.MaxHorizon);
    }
}
