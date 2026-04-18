import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Tipos del modelo de datos
export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  phone?: string;
}

export interface Account {
  id: string;
  profileId: string;
  balance: number;
  type: string;
  number: string;
  status: string;
}

export interface Transaction {
  id: string;
  senderId: string;
  receiverId: string;
  amount: number;
  description?: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

// Obtiene o crea el perfil del usuario autenticado
export async function getOrCreateProfile(): Promise<Profile> {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('No autenticado');

  const { data: profile } = await supabase
    .from('Profile')
    .select('*')
    .eq('userId', user.id)
    .single();

  if (profile) return profile;

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario';
  const { data: newProfile, error } = await supabase
    .from('Profile')
    .insert({ userId: user.id, fullName, email: user.email! })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await supabase.from('Account').insert({
    profileId: newProfile.id,
    balance: 0,
    type: 'CHECKING',
    number: `ACC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    status: 'ACTIVE',
  });

  return newProfile;
}

// Obtiene la cuenta principal del usuario
export async function getAccount(profileId: string): Promise<Account | null> {
  const { data } = await supabase
    .from('Account')
    .select('*')
    .eq('profileId', profileId)
    .eq('status', 'ACTIVE')
    .single();
  return data;
}

// Obtiene transacciones del usuario
export async function getTransactions(profileId: string, limit = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('Transaction')
    .select('*')
    .or(`senderId.eq.${profileId},receiverId.eq.${profileId}`)
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data || [];
}

// Busca un perfil por email para transferencias
export async function getProfileByEmail(email: string): Promise<Profile | null> {
  const { data } = await supabase
    .from('Profile')
    .select('*')
    .eq('email', email)
    .single();
  return data;
}

// Ejecuta una transferencia de fondos
export async function transferFunds(
  senderId: string,
  receiverId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('transfer_funds', {
    p_sender_id: senderId,
    p_receiver_id: receiverId,
    p_amount: amount,
    p_description: description,
    p_idempotency_key: Math.random().toString(36).substring(2),
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}
