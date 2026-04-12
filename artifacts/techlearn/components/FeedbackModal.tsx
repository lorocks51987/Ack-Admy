import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

interface FeedbackModalProps {
  visible: boolean;
  correct: boolean;
  explanation?: string;
  onContinue: () => void;
}

export function FeedbackModal({ visible, correct, explanation, onContinue }: FeedbackModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (!visible) return null;

  const bgColor = correct ? "#E6F9ED" : "#FDECEA";
  const textColor = correct ? "#16A349" : "#D93025";
  const iconName = correct ? "check-circle" : "x-circle";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingBottom: bottomPad + 16,
          borderTopColor: correct ? "#16A349" : "#D93025",
        },
      ]}
    >
      <View style={styles.header}>
        <Feather name={iconName as "check-circle" | "x-circle"} size={28} color={textColor} />
        <Text style={[styles.title, { color: textColor }]}>
          {correct ? "Correto!" : "Incorreto!"}
        </Text>
      </View>
      {explanation ? (
        <Text style={[styles.explanation, { color: textColor }]}>{explanation}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: correct ? "#16A349" : "#D93025" }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onContinue();
        }}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  explanation: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  btn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
