import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserForm } from './UserForm';
import { getUsers, deleteUser, updateUser, createUser, type User, type UpdateUserDto, type CreateUserDto } from '@/lib/api';
import { Pencil, Trash2, UserPlus } from 'lucide-react';

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi');
      console.error('Kullanıcılar yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (data: CreateUserDto | UpdateUserDto) => {
    try {
      if (!('name' in data && 'email' in data && 'password' in data)) {
        throw new Error('Geçersiz veri formatı');
      }
      await createUser(data as CreateUserDto);
      await loadUsers();
      setIsCreateDialogOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleUpdate = async (data: CreateUserDto | UpdateUserDto) => {
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, data as UpdateUserDto);
      await loadUsers();
      setIsEditDialogOpen(false);
      setEditingUser(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      return;
    }
    try {
      await deleteUser(id);
      await loadUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Kullanıcı silinemedi');
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const getImageUrl = (profileImage?: string) => {
    if (!profileImage) return undefined;
    // Eğer tam URL ise direkt döndür, değilse API base URL ekle
    if (profileImage.startsWith('http')) return profileImage;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5089'}/${profileImage}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Kullanıcı Listesi</CardTitle>
              <CardDescription>
                Tüm kayıtlı kullanıcıları görüntüleyin, düzenleyin veya silin
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Yeni Kullanıcı
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz kullanıcı kaydı yok.</p>
              <p className="text-sm mt-2">Yeni kullanıcı eklemek için yukarıdaki butona tıklayın.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profil</TableHead>
                  <TableHead>İsim</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={getImageUrl(user.profileImage)} alt={user.name} />
                        <AvatarFallback>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Yeni Kullanıcı Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
          </DialogHeader>
          <UserForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <UserForm
              onSubmit={handleUpdate}
              initialData={{
                name: editingUser.name,
                email: editingUser.email,
                profileImage: editingUser.profileImage,
              }}
              isEditing={true}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingUser(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

