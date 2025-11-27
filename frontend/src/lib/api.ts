// API service layer - Backend entegrasyonu için

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5089/api';

export interface User {
  id: number;
  name: string;
  email: string;
  profileImage?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  profileImage?: File;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  profileImage?: File;
}

// Tüm kullanıcıları getir
export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_BASE_URL}/users`);
  if (!response.ok) {
    throw new Error('Kullanıcılar yüklenemedi');
  }
  return response.json();
}

// Tek kullanıcı getir
export async function getUser(id: number): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`);
  if (!response.ok) {
    throw new Error('Kullanıcı yüklenemedi');
  }
  return response.json();
}

// Yeni kullanıcı oluştur
export async function createUser(userData: CreateUserDto): Promise<User> {
  const formData = new FormData();
  formData.append('name', userData.name);
  formData.append('email', userData.email);
  formData.append('password', userData.password);
  if (userData.profileImage) {
    formData.append('profileImage', userData.profileImage);
  }

  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Kullanıcı oluşturulamadı');
  }

  return response.json();
}

// Kullanıcı güncelle
export async function updateUser(id: number, userData: UpdateUserDto): Promise<User> {
  const formData = new FormData();
  if (userData.name) formData.append('name', userData.name);
  if (userData.email) formData.append('email', userData.email);
  if (userData.password) formData.append('password', userData.password);
  if (userData.profileImage) {
    formData.append('profileImage', userData.profileImage);
  }

  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Kullanıcı güncellenemedi');
  }

  return response.json();
}

// Kullanıcı sil
export async function deleteUser(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Kullanıcı silinemedi');
  }
}

