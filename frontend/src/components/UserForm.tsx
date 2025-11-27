import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, Upload } from 'lucide-react';
import type { CreateUserDto, UpdateUserDto } from '@/lib/api';

interface UserFormProps {
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  initialData?: {
    name: string;
    email: string;
    profileImage?: string;
  };
  isEditing?: boolean;
  onCancel?: () => void;
}

export function UserForm({ onSubmit, initialData, isEditing = false, onCancel }: UserFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  // Preview için URL oluştur 
  const getPreviewUrl = (img?: string) => {
    if (!img) return null;
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5089'}/${img}`;
  };
  const [preview, setPreview] = useState<string | null>(getPreviewUrl(initialData?.profileImage) || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // initialData değiştiğinde preview'ı güncelle
  useEffect(() => {
    if (initialData?.profileImage && !profileImage) {
      setPreview(getPreviewUrl(initialData.profileImage));
    }
  }, [initialData?.profileImage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      // Preview oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isEditing) {
        const updateData: UpdateUserDto = {
          name: name || undefined,
          email: email || undefined,
          password: password || undefined,
          profileImage: profileImage || undefined,
        };
        await onSubmit(updateData as CreateUserDto | UpdateUserDto);
      } else {
        if (!name || !email || !password) {
          throw new Error('Tüm alanlar zorunludur');
        }
        const createData: CreateUserDto = {
          name,
          email,
          password,
          profileImage: profileImage || undefined,
        };
        await onSubmit(createData as CreateUserDto | UpdateUserDto);
      }
      
      // Form'u temizle
      if (!isEditing) {
        setName('');
        setEmail('');
        setPassword('');
        setProfileImage(null);
        setPreview(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Kaydı'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Kullanıcı bilgilerini güncelleyin' 
            : 'Kullanıcı bilgilerini girin ve kaydedin'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profil Resmi Önizleme ve Yükleme */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={preview || undefined} alt={name || 'Profil'} />
              <AvatarFallback>
                {name ? name.charAt(0).toUpperCase() : <UserPlus className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center gap-2">
              <Label htmlFor="profileImage" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Profil Resmi Seç</span>
                </div>
              </Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {profileImage && (
                <p className="text-sm text-muted-foreground">{profileImage.name}</p>
              )}
            </div>
          </div>

          {/* İsim */}
          <div className="space-y-2">
            <Label htmlFor="name">İsim *</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kullanıcı adı"
              required={!isEditing}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required={!isEditing}
            />
          </div>

          {/* Parola */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Parola {isEditing ? '(Değiştirmek için doldurun)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required={!isEditing}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                İptal
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

