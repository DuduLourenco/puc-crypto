using PucCrypto.BuildingBlocks.Authentication;

var builder = WebApplication.CreateBuilder(args);

// O Gateway valida o JWT emitido pelo Identity. As rotas que exigem
// autenticação são marcadas com AuthorizationPolicy na configuração do YARP.
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddHealthChecks();
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapReverseProxy();

app.Run();
