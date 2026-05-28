import { Link, Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Eye, EyeOff } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, loading, profileLoading, refreshProfile, isGuest, loginAsGuest } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (session && !isLoading && !loading && !profileLoading) {
    return <Redirect href="/(tabs)" />;
  }

  const validateForm = () => {
    if (!email.trim() || !email.includes("@")) return "E-mail inválido.";
    if (!password) return "A senha é obrigatória.";
    return null;
  };

  const handleSignIn = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message.includes("Invalid login credentials")) {
          throw new Error("E-mail ou senha incorretos.");
        }
        throw new Error(signInError.message);
      }

      if (data.session) {
        await refreshProfile(data.session.user.id);
        router.replace("/(tabs)" as any);
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao entrar.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : Platform.OS === "android" ? "height" : undefined} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 80 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoArea}>
            <View style={[s.logoCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
              <Shield size={36} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[s.appName, { color: colors.foreground }]}>ACK-ADMY</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Segurança da Informação — Unimar</Text>
          </View>

          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.foreground }]}>Entrar</Text>
            <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Acesse sua conta</Text>

            {error ? (
              <View style={[s.errBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}>
                <Text style={[s.errText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>E-mail</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="seu@email.com" placeholderTextColor={colors.mutedForeground}
                value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email"
              />
            </View>

            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Senha</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, s.passwordInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="••••••••" placeholderTextColor={colors.mutedForeground}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="password"
                />
                <TouchableOpacity
                  style={[s.eyeBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
                  onPress={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.primary }, (isLoading || !email || !password) ? s.btnDisabled : undefined]}
              onPress={handleSignIn} disabled={isLoading || !email || !password} activeOpacity={0.8}
            >
              {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Entrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.btn, { backgroundColor: "transparent", borderColor: colors.border, borderWidth: 1 }]}
              onPress={() => {
                loginAsGuest();
                router.replace("/(tabs)" as any);
              }}
              activeOpacity={0.8}
            >
              <Text style={[s.btnText, { color: colors.foreground }]}>Testar sem login</Text>
            </TouchableOpacity>

            <View style={s.footer}>
              <Text style={[s.footerText, { color: colors.mutedForeground }]}>Não tem uma conta? </Text>
              <Link href="/sign-up" asChild>
                <TouchableOpacity><Text style={[s.footerLink, { color: colors.primary }]}>Cadastrar</Text></TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flexGrow: 1, padding: 20, gap: 24, paddingTop: 60 },
  logoArea:     { alignItems: "center", gap: 10 },
  logoCircle:   { width: 72, height: 72, borderRadius: 36, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  appName:      { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline:      { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  card:         { borderRadius: 16, borderWidth: 1, padding: 24, gap: 16 },
  title:        { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle:     { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: -8 },
  errBanner:    { borderRadius: 8, borderWidth: 1, padding: 12 },
  errText:      { fontSize: 13, fontFamily: "Inter_400Regular" },
  field:        { gap: 6 },
  label:        { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  input:        { height: 48, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  passwordRow:  { flexDirection: "row", gap: 8 },
  passwordInput:{ flex: 1 },
  eyeBtn:       { width: 48, height: 48, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btn:          { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnDisabled:  { opacity: 0.5 },
  btnText:      { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer:       { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  footerLink:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
