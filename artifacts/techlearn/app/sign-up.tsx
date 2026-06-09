import { Link, Redirect, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, ActivityIndicator, Modal, Pressable, FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Shield, Eye, EyeOff, CheckCircle2, ChevronDown, Check } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/services/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

const COURSES = [
  "Análise e Desenvolvimento de Sistemas",
  "Ciência da Computação",
  "Inteligência Artificial",
  "Cibersegurança e Infraestrutura de Redes",
];

const TERMS = ["1º Termo", "3º Termo", "5º Termo", "7º Termo"];
const ROOMS = ["A", "B", "C", "D"];

// ── Picker Modal (fora do componente principal para evitar re-mount) ──────────
function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
  onClose: () => void;
  colors: any;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={pm.overlay} onPress={onClose}>
        <Pressable style={[pm.sheet, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          {/* Handle */}
          <View style={[pm.handle, { backgroundColor: colors.border }]} />
          <Text style={[pm.title, { color: colors.foreground }]}>{title}</Text>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <TouchableOpacity
                  style={[
                    pm.option,
                    { borderBottomColor: colors.border + "40" },
                    isSelected && { backgroundColor: colors.primary + "12" },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSelect(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      pm.optionText,
                      { color: isSelected ? colors.primary : colors.foreground },
                      isSelected && { fontFamily: "Inter_700Bold" },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && <Check size={18} color={colors.primary} strokeWidth={2.5} />}
                </TouchableOpacity>
              );
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
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

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [isExternal, setIsExternal] = useState(false);

  // Picker modal state: null = closed, or the picker id
  const [activePicker, setActivePicker] = useState<"course" | "term" | "room" | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  if (session && !isLoading && !loading && !profileLoading) {
    return <Redirect href="/(tabs)" />;
  }

  const validateForm = () => {
    if (!name.trim()) return "Informe seu nome completo.";
    if (!email.trim() || !email.includes("@")) return "E-mail inválido.";
    if (!isExternal) {
      if (!selectedCourse) return "Selecione o curso.";
      if (!selectedTerm) return "Selecione o termo.";
      if (!selectedRoom) return "Selecione a sala.";
    }
    if (password.length < 6) return "Senha com no mínimo 6 caracteres.";
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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: undefined },
      });

      if (authError) {
        let msg = authError.message;
        if (msg.includes("User already registered")) msg = "E-mail já cadastrado. Faça login.";
        else if (msg.includes("Password should be")) msg = "Senha com no mínimo 6 caracteres.";
        else if (msg.includes("Signup requires a valid email")) msg = "E-mail inválido.";
        throw new Error(msg);
      }

      const user = authData?.user;

      if (user) {
        const className = isExternal ? "Visitante Externo" : `${selectedCourse} - ${selectedTerm} ${selectedRoom}`;

        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: "student",
          course: isExternal ? null : selectedCourse,
          term: isExternal ? null : selectedTerm,
          room: isExternal ? null : selectedRoom,
          class_name: className,
          profile_type: isExternal ? "external" : "student",
        });

        if (profileError) {
          console.error("Profile insert error:", profileError);
          throw new Error("Conta criada, mas perfil não foi salvo. Contate o suporte.");
        }

        const { error: progressError } = await supabase.from("user_progress").insert({
          user_id: user.id,
          xp: 0,
          completed_modules: [],
          correct_answers: 0,
          total_exercises: 0,
          streak: 0,
          lives: 3,
        });

        if (progressError) {
          console.warn("Progress insert warning:", progressError);
        }

        await refreshProfile(user.id);
      }

      if (user && !authData.session) {
        setStep("verify");
      } else {
        router.replace("/(tabs)" as any);
      }
    } catch (err: any) {
      setError(err?.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Verify screen ──
  if (step === "verify") {
    return (
      <View style={[s.root, { backgroundColor: colors.background }]}>
        <View style={[s.centerContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>
          <View style={[s.logoCircle, { backgroundColor: colors.success + "20", borderColor: colors.success + "40" }]}>
            <CheckCircle2 size={36} color={colors.success} strokeWidth={2} />
          </View>
          <Text style={[s.appName, { color: colors.foreground }]}>Quase lá!</Text>
          <Text style={[s.verifyText, { color: colors.mutedForeground }]}>
            Enviamos um link de confirmação para{"\n"}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>{email}</Text>
            {"\n\n"}Acesse seu e-mail, confirme a conta e faça login.
          </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity style={[s.btn, { backgroundColor: colors.primary, marginTop: 24 }]} activeOpacity={0.85}>
              <Text style={s.btnText}>Ir para o Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }

  // ── Form screen ──
  const isFormValid =
    !!name.trim() && !!email.trim() && 
    (isExternal || (!!selectedCourse && !!selectedTerm && !!selectedRoom)) &&
    password.length >= 6 && password === confirmPassword;

  const SelectField = ({
    label,
    value,
    pickerId,
    placeholder,
  }: {
    label: string;
    value: string;
    pickerId: "course" | "term" | "room";
    placeholder: string;
  }) => (
    <View style={s.field}>
      <Text style={[s.label, { color: colors.mutedForeground }]}>{label}</Text>
      <TouchableOpacity
        style={[
          s.selectBtn,
          {
            backgroundColor: colors.input,
            borderColor: value ? colors.primary + "80" : colors.border,
          },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setActivePicker(pickerId);
        }}
        activeOpacity={0.8}
      >
        <Text
          style={[
            s.selectBtnText,
            { color: value ? colors.foreground : colors.mutedForeground },
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>
        <ChevronDown size={18} color={value ? colors.primary : colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: colors.background }]}>
      {/* Picker Modals — renderizados fora do KeyboardAvoidingView para não interferir */}
      <PickerModal
        visible={activePicker === "course"}
        title="Selecione o Curso"
        options={COURSES}
        selected={selectedCourse}
        onSelect={setSelectedCourse}
        onClose={() => setActivePicker(null)}
        colors={colors}
      />
      <PickerModal
        visible={activePicker === "term"}
        title="Selecione o Termo"
        options={TERMS}
        selected={selectedTerm}
        onSelect={setSelectedTerm}
        onClose={() => setActivePicker(null)}
        colors={colors}
      />
      <PickerModal
        visible={activePicker === "room"}
        title="Selecione a Sala"
        options={ROOMS}
        selected={selectedRoom}
        onSelect={setSelectedRoom}
        onClose={() => setActivePicker(null)}
        colors={colors}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={[
            s.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 100 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.logoArea}>
            <View style={[s.logoCircle, { backgroundColor: colors.primary + "20", borderColor: colors.primary + "40" }]}>
              <Shield size={32} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={[s.appName, { color: colors.foreground }]}>ACK-ADMY</Text>
            <Text style={[s.tagline, { color: colors.mutedForeground }]}>Criar conta de aluno</Text>
          </View>

          {/* Card */}
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

            {/* Error banner */}
            {error ? (
              <View style={[s.errBanner, { backgroundColor: colors.error + "15", borderColor: colors.error + "40" }]}>
                <Text style={[s.errText, { color: colors.error }]}>{error}</Text>
              </View>
            ) : null}

            {/* Nome */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Nome completo</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="João Silva"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoComplete="name"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>

            {/* Email */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>E-mail acadêmico</Text>
              <TextInput
                ref={emailRef}
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="seu@unimar.br"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
            </View>

            {/* Checkbox Visitante */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 8, paddingHorizontal: 4 }}>
              <TouchableOpacity
                onPress={() => setIsExternal(!isExternal)}
                style={{
                  width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
                  borderColor: isExternal ? colors.primary : colors.border,
                  backgroundColor: isExternal ? colors.primary : "transparent",
                  alignItems: "center", justifyContent: "center", marginRight: 10
                }}
                activeOpacity={0.8}
              >
                {isExternal && <Check size={14} color="#FFF" strokeWidth={3} />}
              </TouchableOpacity>
              <Text style={{ color: colors.foreground, fontSize: 13, fontFamily: "Inter_500Medium" }}>Não possuo curso (Visitante Externo)</Text>
            </View>

            {/* Dados Acadêmicos */}
            {!isExternal && (
              <View style={s.section}>
                <Text style={[s.sectionTitle, { color: colors.foreground }]}>Dados Acadêmicos</Text>
                <SelectField
                  label="Curso"
                  value={selectedCourse}
                  pickerId="course"
                  placeholder="Selecione seu curso"
                />
                <View style={s.row}>
                  <View style={{ flex: 1 }}>
                    <SelectField
                      label="Termo"
                      value={selectedTerm}
                      pickerId="term"
                      placeholder="Termo"
                    />
                  </View>
                  <View style={{ width: 96 }}>
                    <SelectField
                      label="Sala"
                      value={selectedRoom}
                      pickerId="room"
                      placeholder="Sala"
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Senha */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Senha</Text>
              <View style={s.passwordRow}>
                <TextInput
                  ref={passwordRef}
                  style={[s.input, s.passwordInput, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                />
                <TouchableOpacity
                  style={[s.eyeBtn, { backgroundColor: colors.input, borderColor: colors.border }]}
                  onPress={() => setShowPassword((v) => !v)}
                >
                  {showPassword
                    ? <EyeOff size={18} color={colors.mutedForeground} />
                    : <Eye size={18} color={colors.mutedForeground} />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar senha */}
            <View style={s.field}>
              <Text style={[s.label, { color: colors.mutedForeground }]}>Confirmar senha</Text>
              <TextInput
                ref={confirmPasswordRef}
                style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Repita a senha"
                placeholderTextColor={colors.mutedForeground}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={handleSignUp}
              />
            </View>

            {/* Botão criar conta */}
            <TouchableOpacity
              style={[
                s.btn,
                { backgroundColor: isFormValid && !isLoading ? colors.primary : colors.muted },
                (!isFormValid || isLoading) && s.btnDisabled,
              ]}
              onPress={handleSignUp}
              disabled={isLoading || !isFormValid}
              activeOpacity={0.85}
            >
              {isLoading
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={s.btnText}>Criar conta</Text>}
            </TouchableOpacity>

            {/* Link para login */}
            <View style={s.footer}>
              <Text style={[s.footerText, { color: colors.mutedForeground }]}>Já tem uma conta? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={[s.footerLink, { color: colors.primary }]}>Entrar</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flexGrow: 1, padding: 20, gap: 0 },
  centerContent:{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },

  logoArea:     { alignItems: "center", gap: 8, marginBottom: 24 },
  logoCircle:   { width: 64, height: 64, borderRadius: 32, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  appName:      { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  tagline:      { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  verifyText:   { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },

  card:         { borderRadius: 16, borderWidth: 1, padding: 20, gap: 16 },
  errBanner:    { borderRadius: 8, borderWidth: 1, padding: 12 },
  errText:      { fontSize: 13, fontFamily: "Inter_400Regular" },

  section:      { gap: 12, paddingTop: 4, paddingBottom: 4 },
  sectionTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  row:          { flexDirection: "row", gap: 10 },

  field:        { gap: 6 },
  label:        { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  input:        { height: 50, borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: "Inter_400Regular" },

  selectBtn:    {
    height: 50, borderRadius: 10, borderWidth: 1,
    paddingHorizontal: 14, flexDirection: "row",
    alignItems: "center", justifyContent: "space-between",
    gap: 8,
  },
  selectBtnText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },

  passwordRow:  { flexDirection: "row", gap: 8 },
  passwordInput:{ flex: 1 },
  eyeBtn:       { width: 50, height: 50, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },

  btn:          { height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 4 },
  btnDisabled:  { opacity: 0.55 },
  btnText:      { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },

  footer:       { flexDirection: "row", justifyContent: "center" },
  footerText:   { fontSize: 13, fontFamily: "Inter_400Regular" },
  footerLink:   { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});

// ── Picker Modal Styles ───────────────────────────────────────────────────────
const pm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:      {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "70%",
  },
  handle:     { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  title:      { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, textAlign: "center" },
  option:     {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16, borderBottomWidth: 1,
  },
  optionText: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 22 },
});
