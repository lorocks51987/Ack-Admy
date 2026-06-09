import React from "react";
import { View, StyleSheet, Animated } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  progress: number;
  total: number;
}

export function ProgressBar({ progress, total }: ProgressBarProps) {
  const colors = useColors();
  const pct = Math.max(0, Math.min(progress / total, 1));

  return (
    <View style={[styles.track, { backgroundColor: colors.muted }]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: colors.primary,
            width: `${pct * 100}%` as unknown as number,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  fill: {
    height: 8,
    borderRadius: 4,
  },
});
