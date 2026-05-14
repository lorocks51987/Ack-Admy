import { Link, Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Eye, EyeOff, CheckCircle2 } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session, loading, profileLoading, refreshProfile } = useAuth();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Se já estiver logado (e os dados tiverem terminado de carregar localmente), redireciona
  if (session && !isLoading && !loading && !profileLoading) {
    return <Redirect href="/(tabs)" />;
  }

  const validateForm = () => {
    if (!name.trim()) return "O nome é obrigatório.";
    if (!email.trim() || !email.includes("@")) return "E-mail inválido.";
    if (password.length < 6) return "A senha deve ter no mínimo 6 caracteres.";
    if (password !== confirmPassword) return "As senhas não coincidem.";
    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    
    try {
      // 1. Cadastrar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined
        }
      });

      if (authError) throw new Error(authError.message);

      const user = authData?.user;
      
      if (user) {
        // 2. Inserir na tabela profiles (apenas alunos no cadastro público)
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          name: name,
          email: email,
          role: "student",
          class_name: "ADS - 5º Termo"
        });

        if (profileError) {
          console.error("Profile insert error:", profileError);
          throw new Error("Sua conta foi criada, mas falhamos ao salvar o perfil. Contate o suporte.");
        }

        // 3. Criar user_progress inicial
        const { error: progressError } = await supabase.from('user_progress').insert({
          user_id: user.id,
          xp: 0,
          completed_modules: [],
          correct_answers: 0,
          total_exercises: 0,
          streak: 0,
          lives: 3
        });

        if (progressError) {
          console.warn("Progress insert error:", progressError);
        }
        
        // REFRESCAR O PERFIL NO CONTEXTO AGORA QUE ELE FOI INSERIDO
        await refreshProfile(user.id);
      }

      // Se não houver sessão automática, pode requerer confirmação de email
      if (user && !authData.session) {
        setStep("verify");
      } else {
        router.replace("/(tabs)" as any);
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollProps = {
    contentContainerStyle: [s.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }] as any,
    keyboardShouldPersistTaps: "handled" as const,
    showsVerticalScrollIndicator: false,
  };

  if (step === "verify") {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <ScrollView {...scrollProps}>
            <View style={s.logoArea}>
              <View style={[s.logoCircle, { backgroundColor: colors.success + "20", borderColor: colors.success + "40" }]}>
                <CheckCircle2 size={36} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={[s.appName, { color: colors.foreground }]}>Verificação Necessária</Text>
              <Text style={[s.tagline, { color: colors.mutedForeground, paddingHorizontal: 20 }]}>
                Enviamos um link de confirmação para{"\n"}{email}.{"\n\n"}
                Por favor, acesse seu e-mail, confirme a conta, e depois faça login.
              </Text>
            </View>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
              <Link href="/sign-in" asChild>
                <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
                  <Text style={s.btnText}>Ir para Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  const isFormValid = name && email && password && confirmPassword && (password === confirmPassword);

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView {...scrollProps}>
          <View style={s.logoArea}>
            <View style={[s.logoCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
              <Shield size={36} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[s.appName, { color: colors.foreground }]}>ACK-ADMY</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Criar conta de aluno</Text>
          </View>
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.foreground }]}>Cadastrar</Text>
            <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Acesse sua trilha de Segurança da Informação</Text>

            {error ? (
              <View style={[s.errBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}>
                <Text style={[s.errText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}



            {[
              { label: "Nome completo", value: name, onChange: setName, placeholder: "João Silva", autoComplete: "name", autoCapitalize: "words" as const },
              { label: "E-mail acadêmico", value: email, onChange: setEmail, placeholder: "seu@unimar.br", autoComplete: "email", keyboardType: "email-address" as const, autoCapitalize: "none" as const },
            ].map(({ label, value, onChange, placeholder, ...rest }) => (
              <View key={label} style={s.field}>
                <Text style={[s.label, { color: colors.mutedForeground }]}>{label}</Text>
                <TextInput
                  style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder={placeholder} placeholderTextColor={colors.mutedForeground}
                  value={value} onChangeText={onChange} {...rest}
                />
              </View>
            ))}

            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Senha</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, s.passwordInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Mínimo 6 caracteres" placeholderTextColor={colors.mutedForeground}
                  value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="new-password"
                />
                <TouchableOpacity
                  style={[s.eyeBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
                  onPress={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={18} color={colors.mutedForeground} /> : <Eye size={18} color={colors.mutedForeground} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Confirmar Senha</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Repita a senha" placeholderTextColor={colors.mutedForeground}
                value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showPassword} autoComplete="new-password"
              />
            </View>

            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.primary }, (isLoading || !isFormValid) ? s.btnDisabled : undefined]}
              onPress={handleSignUp} disabled={isLoading || !isFormValid} activeOpacity={0.8}
            >
              {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Criar conta</Text>}
            </TouchableOpacity>

            <View style={s.footer}>
              <Text style={[s.footerText, { color: colors.mutedForeground }]}>Já tem uma conta? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity><Text style={[s.footerLink, { color: colors.primary }]}>Entrar</Text></TouchableOpacity>
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
  scroll:       { flexGrow: 1, padding: 20, gap: 24, paddingTop: 40 },
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
  codeInput:    { textAlign: "center", fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: 8 },
  passwordRow:  { flexDirection: "row", gap: 8 },
  passwordInput:{ flex: 1 },
  eyeBtn:       { width: 48, height: 48, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btn:          { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnDisabled:  { opacity: 0.5 },
  btnText:      { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer:       { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  footerLink:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
