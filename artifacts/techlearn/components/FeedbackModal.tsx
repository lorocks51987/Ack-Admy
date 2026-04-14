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

  const bgColor = correct ? "#0D2010" : "#2D0A0A";
  const accentColor = correct ? "#00FF66" : "#FF4444";
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
        <Feather name={iconName as "check-circle" | "x-circle"} size={26} color={accentColor} />
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
        <Text style={[styles.btnText, { color: "#121212" }]}>Continuar</Text>
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
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
});
