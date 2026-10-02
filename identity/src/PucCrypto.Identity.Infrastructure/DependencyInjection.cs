using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PucCrypto.Identity.Application.Abstractions;
using PucCrypto.Identity.Infrastructure.Persistence;
using PucCrypto.Identity.Infrastructure.Persistence.Repositories;
using PucCrypto.Identity.Infrastructure.Security;

namespace PucCrypto.Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Database")));

        services.AddScoped<IUserRepository, UserRepository>();

        services.AddOptions<JwtOptions>()
            .BindConfiguration(JwtOptions.SectionName)
            .Validate(
                options => !string.IsNullOrWhiteSpace(options.Issuer) && !string.IsNullOrWhiteSpace(options.Audience),
                "Jwt:Issuer e Jwt:Audience são obrigatórios.")
            .Validate(
                options => Encoding.UTF8.GetByteCount(options.SigningKey) >= JwtOptions.MinimumSigningKeyBytes,
                $"Jwt:SigningKey deve ter ao menos {JwtOptions.MinimumSigningKeyBytes} bytes.")
            .Validate(options => options.ExpirationMinutes > 0, "Jwt:ExpirationMinutes deve ser maior que zero.")
            .ValidateOnStart();

        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddSingleton(TimeProvider.System);

        return services;
    }
}
