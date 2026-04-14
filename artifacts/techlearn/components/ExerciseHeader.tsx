import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { ProgressBar } from "./ProgressBar";

interface ExerciseHeaderProps {
  current: number;
  total: number;
  lives: number;
  onClose: () => void;
}

export function ExerciseHeader({ current, total, lives, onClose }: ExerciseHeaderProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: topPad + 8,
          backgroundColor: colors.background,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Feather name="x" size={22} color={colors.mutedForeground} />
      </TouchableOpacity>

      <ProgressBar progress={current} total={total} />

      <View style={styles.livesContainer}>
        <Feather name="heart" size={18} color="#FF4444" />
        <Text style={[styles.livesText, { color: "#FF4444" }]}>{lives}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  closeBtn: {
    padding: 2,
  },
  livesContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  livesText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
