using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<FileService>();

// Controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Veritabanını ve tabloları otomatik oluştur (eğer yoksa)
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    
    // MSSQL hazır olana kadar bekle (max 30 saniye)
    var maxRetries = 30;
    var retryCount = 0;
    var connected = false;
    
    while (retryCount < maxRetries && !connected)
    {
        try
        {
            // Direkt EnsureCreated() çalıştır - bu hem bağlantıyı test eder hem tabloyu oluşturur
            dbContext.Database.EnsureCreated();
            connected = true;
            logger.LogInformation("Veritabanı bağlantısı başarılı ve tablolar hazır.");
        }
        catch (Exception ex)
        {
            retryCount++;
            if (retryCount < maxRetries)
            {
                logger.LogWarning($"Veritabanı bağlantısı kurulamadı (Deneme {retryCount}/{maxRetries}). 1 saniye sonra tekrar denenecek...");
                Thread.Sleep(1000);
            }
            else
            {
                // Son denemede de başarısız olursa, tablo zaten var olabilir - uygulama devam etsin
                logger.LogWarning(ex, "Veritabanı bağlantısı kurulamadı veya tablo zaten mevcut. Uygulama devam ediyor...");
                connected = true; // Devam et, belki tablo zaten var
            }
        }
    }
}

app.UseStaticFiles();

// Uploads klasörü için özel static files yapılandırması
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "uploads")),
    RequestPath = "/uploads"
});


app.UseCors("AllowFrontend");



app.UseHttpsRedirection();
app.MapControllers();

app.Run();