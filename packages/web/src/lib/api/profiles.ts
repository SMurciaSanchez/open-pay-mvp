import { supabase } from '../supabase';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tipos
export interface ProfileData {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfileError {
  message: string;
  status: number;
}

// Funciones para gestionar perfiles
export const createProfile = async (data: ProfileData): Promise<ProfileResponse | ProfileError> => {
  try {
    // Verificar si ya existe un perfil para este usuario
    const existingProfile = await prisma.profile.findFirst({
      where: {
        userId: data.userId
      }
    });

    if (existingProfile) {
      return {
        message: 'Ya existe un perfil para este usuario',
        status: 400
      };
    }

    // Crear perfil
    const profile = await prisma.profile.create({
      data: {
        userId: data.userId,
        fullName: data.fullName,
        email: data.email,
        avatarUrl: data.avatarUrl,
        phone: data.phone
      }
    });

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl || undefined,
      phone: profile.phone || undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  } catch (error: any) {
    console.error('Error al crear perfil:', error);
    return {
      message: error.message || 'Error al crear el perfil',
      status: 500
    };
  }
};

export const getProfileByUserId = async (userId: string): Promise<ProfileResponse | ProfileError> => {
  try {
    const profile = await prisma.profile.findFirst({
      where: {
        userId
      }
    });

    if (!profile) {
      return {
        message: 'Perfil no encontrado',
        status: 404
      };
    }

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl || undefined,
      phone: profile.phone || undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  } catch (error: any) {
    return {
      message: error.message || 'Error al obtener el perfil',
      status: 500
    };
  }
};

export const updateProfile = async (id: string, data: Partial<ProfileData>): Promise<ProfileResponse | ProfileError> => {
  try {
    // Verificar que el perfil existe
    const existingProfile = await prisma.profile.findUnique({
      where: {
        id
      }
    });

    if (!existingProfile) {
      return {
        message: 'Perfil no encontrado',
        status: 404
      };
    }

    // Actualizar perfil
    const profile = await prisma.profile.update({
      where: {
        id
      },
      data: {
        fullName: data.fullName !== undefined ? data.fullName : undefined,
        email: data.email !== undefined ? data.email : undefined,
        avatarUrl: data.avatarUrl !== undefined ? data.avatarUrl : undefined,
        phone: data.phone !== undefined ? data.phone : undefined
      }
    });

    return {
      id: profile.id,
      userId: profile.userId,
      fullName: profile.fullName,
      email: profile.email,
      avatarUrl: profile.avatarUrl || undefined,
      phone: profile.phone || undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt
    };
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    return {
      message: error.message || 'Error al actualizar el perfil',
      status: 500
    };
  }
};

// Alternativa utilizando Supabase directamente
export const getProfileWithSupabase = async (userId: string): Promise<ProfileResponse | ProfileError> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        message: 'Perfil no encontrado',
        status: 404
      };
    }

    return {
      id: data.id,
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      avatarUrl: data.avatarUrl,
      phone: data.phone,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt)
    };
  } catch (error: any) {
    console.error('Error al obtener perfil con Supabase:', error);
    return {
      message: error.message || 'Error al obtener el perfil',
      status: 500
    };
  }
};

export const uploadAvatar = async (userId: string, file: File): Promise<{ url: string } | ProfileError> => {
  try {
    // Obtener perfil para verificar que el usuario existe
    const profile = await getProfileByUserId(userId);
    
    if ('status' in profile && profile.status !== 200) {
      return profile;
    }
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      });
    
    if (uploadError) {
      throw new Error(uploadError.message);
    }
    
    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    const publicUrl = urlData.publicUrl;
    
    // Actualizar perfil con la nueva URL del avatar
    if ('id' in profile) {
      await updateProfile(profile.id, { avatarUrl: publicUrl });
    }
    
    return { url: publicUrl };
  } catch (error: any) {
    console.error('Error al subir avatar:', error);
    return {
      message: error.message || 'Error al subir la imagen',
      status: 500
    };
  }
}; 