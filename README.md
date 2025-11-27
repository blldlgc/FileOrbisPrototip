## Teknolojiler

- Backend: .NET 9.0, C#, Entity Framework Core, MSSQL
- Frontend: React, TypeScript, Vite, Tailwind CSS

## Docker ile Çalıştırma

### Gereksinimler
- Docker
- Docker Compose

### Komutlar

Projeyi başlatmak için:
```bash
docker-compose up -d
```

Logları görmek için:
```bash
docker-compose logs -f
```

Projeyi durdurmak için:
```bash
docker-compose down
```

Veritabanı verilerini de silmek için:
```bash
docker-compose down -v
```

### Erişim

- Frontend: http://localhost:3000
- Backend API: http://localhost:5089/api
- MSSQL: localhost:1433
  - Kullanıcı: sa
  - Şifre: Test1234.

### API Endpoints

- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/users/{id}` - Kullanıcı detayı
- `POST /api/users` - Yeni kullanıcı oluştur
- `PUT /api/users/{id}` - Kullanıcı güncelle
- `DELETE /api/users/{id}` - Kullanıcı sil

### Notlar

- Profil resimleri `uploads/profile-images/` klasöründe saklanır
- Veritabanı otomatik olarak oluşturulur

