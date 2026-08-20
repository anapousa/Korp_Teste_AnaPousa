using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddHttpClient("DefaultClient")
    .AddStandardResilienceHandler();

builder.Services.AddOpenApi();

builder.Services.AddCors();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        
builder.Services.AddDbContext<FaturamentoDbContext>(options => 
    options.UseNpgsql(connectionString));

var app = builder.Build();

app.UseCors(opcoes => opcoes
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

app.MapPost("/itensNotaFiscal", async (ItemNotaFiscal item_nf, FaturamentoDbContext db) =>
{
    db.ItensNotaFiscal.Add(item_nf); 
    await db.SaveChangesAsync();

    return Results.Created($"/itensNotaFiscal/{item_nf.Id}", item_nf);
});


app.MapPost("/notas", async (NotaFiscal nota, FaturamentoDbContext db) =>
{
    db.NotasFiscais.Add(nota); 
    await db.SaveChangesAsync();

    return Results.Created($"/notas/{nota.Id}", nota);
});

app.MapPut("/notas/{id}/imprimir", async (int id, FaturamentoDbContext db, IHttpClientFactory factory) =>
{
    var nota = await db.NotasFiscais.FindAsync(id);
    if (nota == null) 
        return Results.NotFound("Nota fiscal não encontrada.");

    if (nota.Status != "Aberta")
        return Results.BadRequest("Apenas notas com status 'Aberta' podem ser impressas.");

    var itens = await db.ItensNotaFiscal.Where(i => i.NotaFiscalId == id).ToListAsync();

    if (itens.Count == 0)
        return Results.BadRequest("A nota não possui itens. Adicione produtos antes de imprimir.");

    var client = factory.CreateClient("DefaultClient");
    foreach (var item in itens)
    {
        var urlDoEstoque = $"http://localhost:5195/produtos/{item.ProdutoId}?quantidade={item.Quantidade}";
        
        try 
        {
            var resposta = await client.PutAsync(urlDoEstoque, null);

            if (!resposta.IsSuccessStatusCode)
                return Results.BadRequest($"Erro de estoque no produto ID {item.ProdutoId}. Não é possível imprimir.");
        }
        catch (HttpRequestException) 
        {
            return Results.Problem(
                title: "Sistema de Estoque Indisponível",
                detail: "Não foi possível acessar o controle de estoque no momento. Por favor, aguarde alguns instantes e tente mais tarde.",
                statusCode: 503
            );
        }
    }

    nota.Status = "Fechada";
    await db.SaveChangesAsync();

    return Results.Ok(nota);
});

app.MapGet("/notas/{id}", async (int id, FaturamentoDbContext db) =>
{
    var nota = await db.NotasFiscais.FirstOrDefaultAsync(n => n.Id == id);

    if (nota == null)
    {
        return Results.NotFound(new { detail = "Nota não encontrada." });
    }

    // 2. Busca os itens que pertencem a essa nota usando LINQ (Where)
    // OBS: Substitua "ItensNotaFiscal" pelo nome exato do seu DbSet no DbContext
    var itensDaNota = await db.ItensNotaFiscal
                              .Where(item => item.NotaFiscalId == id)
                              .ToListAsync();

    // 3. Monta o retorno no exato formato que o nosso Angular espera
    return Results.Ok(new
    {
        id = nota.Id,
        status = nota.Status,
        itens = itensDaNota.Select(i => new
        {
            quantidade = i.Quantidade,
            produto = new
            {
                id = i.ProdutoId,
                // Como o nome oficial está no Estoque, enviamos uma descrição padrão
                descricao = "Produto Cód. " + i.ProdutoId 
            }
        })
    });
});

app.Run();