import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import type { MultipleChoiceExercise } from "@/constants/lessons";

interface Props {
  exercise: MultipleChoiceExercise;
  onAnswer: (correct: boolean) => void;
}

export function MultipleChoiceScreen({ exercise, onAnswer }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function handleCheck() {
    if (selected === null) return;
    onAnswer(selected === exercise.correct);
  }

  function getOptionStyle(idx: number) {
    if (selected === null) {
      return {
        backgroundColor: colors.card,
        borderColor: colors.border,
      };
    }
    if (idx === exercise.correct) {
      return { backgroundColor: "#E6F9ED", borderColor: "#16A349" };
    }
    if (idx === selected && selected !== exercise.correct) {
      return { backgroundColor: "#FDECEA", borderColor: "#D93025" };
    }
    return { backgroundColor: colors.card, borderColor: colors.border };
  }

  function getOptionTextColor(idx: number) {
    if (selected === null) return colors.foreground;
    if (idx === exercise.correct) return "#16A349";
    if (idx === selected && selected !== exercise.correct) return "#D93025";
    return colors.mutedForeground;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeTag}>
          <Text style={[styles.typeText, { color: colors.primary }]}>
            Escolha a resposta correta
          </Text>
        </View>

        <Text style={[styles.question, { color: colors.foreground }]}>
          {exercise.question}
        </Text>

        <View style={styles.options}>
          {exercise.options.map((opt, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.option, getOptionStyle(idx)]}
              onPress={() => handleSelect(idx)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionLetter,
                  {
                    backgroundColor:
                      selected === null
                        ? colors.muted
                        : idx === exercise.correct
                        ? "#16A349"
                        : idx === selected
                        ? "#D93025"
                        : colors.muted,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.letterText,
                    {
                      color:
                        selected === null
                          ? colors.mutedForeground
                          : idx === exercise.correct || idx === selected
                          ? "#FFFFFF"
                          : colors.mutedForeground,
                    },
                  ]}
                >
                  {["A", "B", "C", "D"][idx]}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  { color: getOptionTextColor(idx) },
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.checkBtn,
            {
              backgroundColor:
                selected !== null ? colors.primary : colors.muted,
            },
          ]}
          onPress={handleCheck}
          activeOpacity={0.85}
          disabled={selected === null}
        >
          <Text
            style={[
              styles.checkText,
              {
                color:
                  selected !== null ? "#FFFFFF" : colors.mutedForeground,
              },
            ]}
          >
            Verificar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  typeTag: { marginBottom: 4 },
  typeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  question: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
    marginBottom: 8,
  },
  options: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 2,
    padding: 14,
    gap: 14,
  },
  optionLetter: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  letterText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFFFFFEE",
  },
  checkBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  checkText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
