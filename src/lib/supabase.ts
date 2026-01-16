import { createClient } from '@supabase/supabase-js';

// Ces valeurs doivent être définies dans un fichier .env
// Pour GitHub Pages, elles seront dans les variables d'environnement du build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using local storage fallback.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour les tables Supabase
export interface ApplicationRow {
  id: string;
  nom_rp: string;
  prenom_rp: string;
  id_joueur: string;
  motivation: string;
  experience: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  session_id: string;
}

export interface SessionRow {
  id: string;
  name: string;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
}

export interface TeamMemberRow {
  id: string;
  user_id?: string | null;
  prenom: string;
  nom: string;
  role: string;
  photo?: string | null;
  order: number;
}

export interface SettingsRow {
  id: string;
  key: string;
  value: string;
}

export interface ClientReviewRow {
  id: string;
  user_id?: string | null;
  nom: string;
  prenom: string;
  id_personnel: string;
  comment: string;
  rating: number;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string | null;
  created_at: string;
  approved_at?: string | null;
}

export interface AppointmentRow {
  id: string;
  user_id?: string | null;
  id_personnel: string;
  nom: string;
  prenom: string;
  telephone: string;
  direction_user_id?: string | null;
  date_time: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  responded_by?: string | null;
  created_at: string;
  responded_at?: string | null;
}

export interface UserRow {
  id: string;
  id_personnel: string;
  password: string;
  telephone: string;
  prenom?: string | null;
  nom?: string | null;
  grade: 'direction' | 'client';
  photo_url?: string | null;
  created_at: string;
}
