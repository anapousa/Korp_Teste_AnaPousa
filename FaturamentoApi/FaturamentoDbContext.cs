using Microsoft.EntityFrameworkCore;

public class FaturamentoDbContext : DbContext
{
    public FaturamentoDbContext(DbContextOptions<FaturamentoDbContext> options) : base(options)
    {
    }
    public DbSet<NotaFiscal> NotasFiscais { get; set; }

    public DbSet<ItemNotaFiscal> ItensNotaFiscal { get; set; }
}