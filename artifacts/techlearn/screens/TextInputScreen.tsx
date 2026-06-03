import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { XCircle, Type } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { TextInputExercise } from "@/constants/lessons";

interface Props {
  exercise: TextInputExercise;
  onAnswer: (correct: boolean, userAnswer?: any) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
  isMistakesReview?: boolean;
}

/**
 * Normaliza uma resposta para comparação tolerante:
 * - converte para minúsculas
 * - remove espaços extras nas bordas
 * - remove acentos e diacríticos (ex: "autorização" → "autorizacao")
 */
function normalizeAnswer(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // remove diacríticos gerados pelo NFD
}

export function TextInputScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false, isMistakesReview = false }: Props) {
  const colors = useColors();
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const locked = feedbackVisible;

  React.useEffect(() => {
    if (powerUpUsed && !value && exercise.answer.length > 0) {
      setValue(exercise.answer.charAt(0));
    }
  }, [powerUpUsed, exercise.answer]);

  const handleCheck = () => {
    if (!value.trim() || locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Aceita sinônimos separados por "|", normaliza acentos/case/espaços em ambos os lados
    const correctAnswers = exercise.answer.split("|").map((ans) => normalizeAnswer(ans));
    const correct = correctAnswers.includes(normalizeAnswer(value));
    onAnswer(correct, value);
  };

  const canCheck = value.trim().length > 0 && !locked;

  return (
    <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.question, { color: colors.foreground }]}>{exercise.question}</Text>
          </View>

          <View style={[
            styles.inputWrapper, 
            { 
              borderColor: value.length > 0 ? colors.primary : colors.border, 
              backgroundColor: colors.input 
            }
          ]}>
            <Type size={20} color={value.length > 0 ? colors.primary : colors.mutedForeground} />
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                { color: colors.foreground },
              ]}
              value={value}
              onChangeText={setValue}
              placeholder="Digite aqui..."
              placeholderTextColor={colors.mutedForeground}
              editable={!locked}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus={true}
              onSubmitEditing={handleCheck}
              returnKeyType="done"
            />
            {value.length > 0 && !locked && (
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  if (powerUpUsed && exercise.answer.length > 0) {
                    setValue(exercise.answer.charAt(0));
                  } else {
                    setValue("");
                  }
                  inputRef.current?.focus();
                }}
              >
                <XCircle size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>

          {isMistakesReview && exercise.answer && (
            <View style={{
              backgroundColor: colors.primary + "12",
              borderColor: colors.primary + "30",
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
              marginTop: 12,
              alignItems: "center"
            }}>
              <Text style={{ fontSize: 13, fontFamily: "Inter_600SemiBold", color: colors.primary }}>
                💡 Pista Inteligente
              </Text>
              {(() => {
                const firstAnswer = exercise.answer.split("|")[0];
                return (
                  <Text style={{ fontSize: 12, fontFamily: "Inter_500Medium", color: colors.foreground, marginTop: 4, textAlign: "center" }}>
                    Começa com "{firstAnswer[0].toUpperCase()}", termina com "{firstAnswer[firstAnswer.length - 1].toUpperCase()}" ({firstAnswer.length} letras)
                  </Text>
                );
              })()}
            </View>
          )}

          <Text style={[styles.helpText, { color: colors.mutedForeground }]}>
            Responda com uma palavra ou expressão curta.
          </Text>
        </ScrollView>

        {!feedbackVisible && (
          <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted, opacity: canCheck ? 1 : 0.6 }]}
              onPress={handleCheck}
              activeOpacity={0.85}
              disabled={!canCheck}
            >
              <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>Confirmar resposta</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kav: { flex: 1 },
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 32 },
  questionCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  question: { fontSize: 17, fontFamily: "Inter_600SemiBold", lineHeight: 28 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
  helpText: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 8 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
  clearBtn: {
    position: "absolute",
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  }
});
