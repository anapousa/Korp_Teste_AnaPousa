using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        
builder.Services.AddDbContext<EstoqueDbContext>(options =>
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

app.MapPost("/produtos", async (Produto produto, EstoqueDbContext db) =>
{
    db.Produtos.Add(produto);
    await db.SaveChangesAsync();

    return Results.Created($"/produtos/{produto.Id}", produto);
});

app.MapGet("/produtos", async (EstoqueDbContext db) =>
    await db.Produtos.ToListAsync());

app.MapPut("/produtos/{id}", async (int id, int quantidade, EstoqueDbContext db) =>
{
   
    int linhasAfetadas = await db.Produtos
        .Where(p => p.Id == id && p.Saldo >= quantidade)
        .ExecuteUpdateAsync(s => s.SetProperty(p => p.Saldo, p => p.Saldo - quantidade));

    if (linhasAfetadas == 0)
    {
        bool produtoExiste = await db.Produtos.AnyAsync(p => p.Id == id);
        if (!produtoExiste) 
        {
            return Results.NotFound(new { detail = "Produto não encontrado no estoque." });
        }

        return Results.BadRequest(new { detail = "Estoque insuficiente ou o produto acabou de ser utilizado por outra nota." });
    }

    var produtoAtualizado = await db.Produtos.FindAsync(id);
    return Results.Ok(produtoAtualizado);
});

app.Run();