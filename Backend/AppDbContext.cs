using Backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend;

public class AppDbContext(IConfiguration configuration) : DbContext
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Release> Releases => Set<Release>();
    public DbSet<ReleaseRating> ReleaseRatings => Set<ReleaseRating>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<SavedRelease> SavedReleases => Set<SavedRelease>();

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseNpgsql(configuration.GetConnectionString("Database"));
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ReleaseRating>().HasOne(ar => ar.User).WithMany(u => u.Ratings).HasForeignKey(ar => ar.UserId);
        modelBuilder.Entity<ReleaseRating>().HasOne(ar => ar.Release).WithMany(a => a.Ratings).HasForeignKey(ar => ar.ReleaseId);
        modelBuilder.Entity<Review>().HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId);
        modelBuilder.Entity<Review>().HasOne(r => r.Release).WithMany(a => a.Reviews).HasForeignKey(r => r.ReleaseId);
        modelBuilder.Entity<SavedRelease>().HasOne(sa => sa.User).WithMany(u => u.SavedReleases).HasForeignKey(sa => sa.UserId);
        modelBuilder.Entity<SavedRelease>().HasOne(sa => sa.Release).WithMany(a => a.SavedByUsers).HasForeignKey(sa => sa.ReleaseId);
    }
}
