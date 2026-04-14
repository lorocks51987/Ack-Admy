import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import type { TextInputExercise } from "@/constants/lessons";

interface Props {
  exercise: TextInputExercise;
  onAnswer: (correct: boolean) => void;
}

export function TextInputScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [value, setValue] = useState("");
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleCheck = () => {
    if (!value.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAnswer(value.trim().toLowerCase() === exercise.answer.toLowerCase());
  };

  const canCheck = value.trim().length > 0;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={[styles.tag, { color: colors.primary }]}>ENTRADA DE TEXTO</Text>
          <Text style={[styles.question, { color: colors.foreground }]}>{exercise.question}</Text>

          <View style={[styles.inputWrapper, { borderColor: value.length > 0 ? colors.primary : colors.border, backgroundColor: colors.input }]}>
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.foreground }]}
              value={value}
              onChangeText={setValue}
              placeholder="Digite sua resposta..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleCheck}
              selectionColor={colors.primary}
            />
            {value.length > 0 && (
              <TouchableOpacity onPress={() => setValue("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="x-circle" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.hintBtn} onPress={() => setShowHint(!showHint)}>
            <Feather name="help-circle" size={15} color={colors.primary} />
            <Text style={[styles.hintLabel, { color: colors.primary }]}>{showHint ? "Ocultar dica" : "Ver dica"}</Text>
          </TouchableOpacity>

          {showHint && (
            <View style={[styles.hintBox, { backgroundColor: "#10131E", borderColor: colors.border }]}>
              <Text style={[styles.hintText, { color: colors.primary }]}>{exercise.hint}</Text>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted }]}
            onPress={handleCheck}
            activeOpacity={0.85}
            disabled={!canCheck}
          >
            <Text style={[styles.btnText, { color: canCheck ? "#0A0E1A" : colors.mutedForeground }]}>Verificar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 120, gap: 16 },
  tag: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  question: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 30 },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderRadius: 10, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
  hintBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hintBox: { borderRadius: 10, borderWidth: 1, padding: 14 },
  hintText: { fontSize: 15, fontFamily: "Inter_500Medium", letterSpacing: 2 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  btn: { borderRadius: 10, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
