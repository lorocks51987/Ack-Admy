import React from "react";
import { View, ActivityIndicator } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/home/AdminDashboard";
import { StudentJourneyHome } from "@/components/home/StudentJourneyHome";

/**
 * HomeScreen — ponto de entrada da aba Home.
 *
 * Responsabilidade única: decidir qual view renderizar.
 *   • Carregando  → spinner
 *   • Sem perfil  → fallback de erro
 *   • Admin       → AdminDashboard (painel do professor)
 *   • Aluno/Guest → StudentJourneyHome (mapa de trilha)
 *
 * IMPORTANTE: todos os hooks são chamados aqui, ANTES de qualquer return
 * condicional, para garantir a ordem estável exigida pelo React.
 */
export default function HomeScreen() {
  const colors = useColors();
  const { profile, loading, profileLoading, isGuest } = useAuth();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading || profileLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  // ── Perfil ausente (não é guest) ─────────────────────────────────────────
  if (!profile && !isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <AlertTriangle size={48} color={colors.mutedForeground} style={{ marginBottom: 16 }} />
        <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold", textAlign: "center", marginBottom: 8 }}>
          Perfil não encontrado.
        </Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center" }}>
          Faça login novamente ou contate o suporte.
        </Text>
      </View>
    );
  }

  // ── Admin → painel administrativo ────────────────────────────────────────
  if (profile?.role === "admin") {
    return <AdminDashboard />;
  }

  // ── Aluno / Visitante → mapa de trilha ───────────────────────────────────
  return <StudentJourneyHome />;
}
