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

  const bgColor = correct ? "#0D1F0D" : "#1F0A0A";
  const accentColor = correct ? "#3FB950" : "#F85149";
  const iconName = correct ? "check-circle" : "x-circle";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          paddingBottom: bottomPad + 16,
          borderTopColor: accentColor,
        },
      ]}
    >
      <View style={styles.header}>
        <Feather name={iconName as "check-circle" | "x-circle"} size={24} color={accentColor} />
        <Text style={[styles.title, { color: accentColor }]}>
          {correct ? "Correto!" : "Incorreto!"}
        </Text>
      </View>
      {explanation ? (
        <Text style={[styles.explanation, { color: colors.mutedForeground }]}>{explanation}</Text>
      ) : null}
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: accentColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onContinue();
        }}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnText, { color: "#0A0E1A" }]}>Continuar</Text>
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
    borderTopWidth: 1,
    gap: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  explanation: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  btn: { borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 4 },
  btnText: { fontSize: 15, fontFamily: "Inter_700Bold", letterSpacing: 0.3 },
});
