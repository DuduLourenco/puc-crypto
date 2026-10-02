using FluentValidation;

namespace PucCrypto.MarketData.Application.Features.ListPricePoints;

internal sealed class ListPricePointsValidator : AbstractValidator<ListPricePointsQuery>
{
    public ListPricePointsValidator()
    {
        RuleFor(query => query.CryptocurrencyId).NotEmpty();
        RuleFor(query => query.Limit).InclusiveBetween(1, ListPricePointsHandler.MaxLimit);
        RuleFor(query => query)
            .Must(query => query.From is null || query.To is null || query.From <= query.To)
            .WithName("From")
            .WithMessage("O início do intervalo deve ser anterior ao fim.");
    }
}
