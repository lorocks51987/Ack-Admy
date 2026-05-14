import { useSignUp } from "@clerk/expo";
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

function WebSignUp() {
  return <Redirect href="/(tabs)" />;
}

function NativeSignUp() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!isLoaded || !name || !email || !password) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    const firstName = name.split(" ")[0];
    const lastName = name.split(" ").slice(1).join(" ") || "";
    try {
      await signUp.create({ emailAddress: email, password, firstName, lastName });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setStep("verify");
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !code) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    setError(null);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/(tabs)" as any);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Código inválido.");
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
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView {...scrollProps}>
            <View style={s.logoArea}>
              <View style={[s.logoCircle, { backgroundColor: colors.success + "20", borderColor: colors.success + "40" }]}>
                <CheckCircle2 size={36} color={colors.success} strokeWidth={2} />
              </View>
              <Text style={[s.appName, { color: colors.foreground }]}>Verificação</Text>
              <Text style={[s.tagline, { color: colors.mutedForeground }]}>Código enviado para{"\n"}{email}</Text>
            </View>
            <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {error ? (
                <View style={[s.errBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}>
                  <Text style={[s.errText, { color: colors.error }]}>{error}</Text>
                </View>
              ) : null}
              <View style={s.field}>
                <Text style={[s.label, { color: colors.mutedForeground }]}>Código de verificação</Text>
                <TextInput
                  style={[s.input, s.codeInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="000000" placeholderTextColor={colors.mutedForeground}
                  value={code} onChangeText={setCode} keyboardType="number-pad" maxLength={6} autoFocus
                />
              </View>
              <TouchableOpacity
                style={[s.btn, { backgroundColor: colors.primary }, (isLoading || code.length < 6) && s.btnDisabled]}
                onPress={handleVerify} disabled={isLoading || code.length < 6} activeOpacity={0.8}
              >
                {isLoading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.btnText}>Verificar</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView {...scrollProps}>
          <View style={s.logoArea}>
            <View style={[s.logoCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
              <Shield size={36} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[s.appName, { color: colors.foreground }]}>ACK-ADMY</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Crie sua conta corporativa</Text>
          </View>
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[s.title, { color: colors.foreground }]}>Cadastrar</Text>
            <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Preencha os dados abaixo</Text>

            {error ? (
              <View style={[s.errBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}>
                <Text style={[s.errText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {[
              { label: "Nome completo", value: name, onChange: setName, placeholder: "João Silva", autoComplete: "name", autoCapitalize: "words" as const },
              { label: "E-mail corporativo", value: email, onChange: setEmail, placeholder: "seu@empresa.com", autoComplete: "email", keyboardType: "email-address" as const, autoCapitalize: "none" as const },
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
                  placeholder="Mínimo 8 caracteres" placeholderTextColor={colors.mutedForeground}
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

            <TouchableOpacity
              style={[s.btn, { backgroundColor: colors.primary }, (isLoading || !name || !email || !password) && s.btnDisabled]}
              onPress={handleSignUp} disabled={isLoading || !name || !email || !password} activeOpacity={0.8}
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

const SignUpScreen = Platform.OS === "web" ? WebSignUp : NativeSignUp;
export default SignUpScreen;

const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flexGrow: 1, justifyContent: "center", padding: 20, gap: 24 },
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
  btn:          { height: 50, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  btnDisabled:  { opacity: 0.5 },
  btnText:      { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  footer:       { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  footerText:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  footerLink:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
