using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

        public DbSet<User> Users { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>(entity =>
            {
                // Tablo adı ve schema (dbo schema'sını açıkça belirt)
                entity.ToTable("Users", "dbo");

                // Primary Key
                entity.HasKey(e => e.Id);

                // Name: NVARCHAR(100) NOT NULL
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(100);

                // Email: NVARCHAR(255) NOT NULL UNIQUE
                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.HasIndex(e => e.Email)
                    .IsUnique()
                    .HasDatabaseName("IX_Users_Email");

                // PasswordHash: NVARCHAR(255) NOT NULL
                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasMaxLength(255);

                // ProfileImagePath: NVARCHAR(500) NULL
                entity.Property(e => e.ProfileImagePath)
                    .HasMaxLength(500);
            });
        }
    }
}