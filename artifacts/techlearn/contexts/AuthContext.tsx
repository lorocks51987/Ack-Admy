import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabaseClient";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  course: string | null;
  term: string | null;
  room: string | null;
  class_name: string | null;
  profile_type?: "student" | "external";
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  isGuest: boolean;
  loginAsGuest: () => void;
  refreshProfile: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  // Começa como true: se não houver sessão, o usuário entra como convidado automaticamente.
  // Será definido como false assim que uma sessão autenticada for detectada.
  const [isGuest, setIsGuest] = useState(true);
  
  const loginAsGuest = () => setIsGuest(true);
  const lastUserRef = useRef<string | null>(null);

  const refreshProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.warn("Supabase AuthContext - Error fetching profile:", error.message);
        setProfile(null);
      } else {
        setProfile(data ? (data as UserProfile) : null);
      }
    } catch (err) {
      console.warn("Supabase AuthContext - Exception fetching profile:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // 1. Buscar a sessão atual na inicialização
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        lastUserRef.current = session.user.id;
        refreshProfile(session.user.id).finally(() => setLoading(false));
      } else {
        lastUserRef.current = null;
        setProfile(null);
        setProfileLoading(false);
        setLoading(false);
      }
    });

    // 2. Escutar mudanças de estado da autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsGuest(false);
        if (lastUserRef.current !== session.user.id) {
          lastUserRef.current = session.user.id;
          refreshProfile(session.user.id);
        }
      } else {
        lastUserRef.current = null;
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Volta para modo convidado após sair — não redireciona para login
    setIsGuest(true);
  };

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, profileLoading, isGuest, loginAsGuest, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
