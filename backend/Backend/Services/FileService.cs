using Microsoft.AspNetCore.Hosting;

namespace Backend.Services
{
    public class FileService
    {
        private readonly IWebHostEnvironment _environment;
        private const string UploadsFolder = "uploads";
        private const string ProfileImagesFolder = "profile-images";

        public FileService(IWebHostEnvironment environment)
        {
            _environment = environment;
        }

        // Profil resmini kaydet ve dosya yolunu döndür
        public async Task<string?> SaveProfileImageAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            // Dosya uzantısını kontrol et
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (!allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Geçersiz dosya formatı. Sadece resim dosyaları kabul edilir.");

            // Benzersiz dosya adı oluştur
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            var uploadsPath = Path.Combine(_environment.ContentRootPath, UploadsFolder, ProfileImagesFolder);
            
            // Klasör yoksa oluştur
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var filePath = Path.Combine(uploadsPath, fileName);

            // Dosyayı kaydet
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Relative path döndür (API'den erişilebilir olması için)
            return Path.Combine(UploadsFolder, ProfileImagesFolder, fileName).Replace("\\", "/");
        }

        // Eski profil resmini sil
        public void DeleteProfileImage(string? imagePath)
        {
            if (string.IsNullOrEmpty(imagePath))
                return;

            var fullPath = Path.Combine(_environment.ContentRootPath, imagePath);
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
            }
        }
    }
}