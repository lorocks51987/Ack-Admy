import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Platform,
} from "react-native";
import Animated, { FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { CheckCircle, XCircle, ChevronRight } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  correct: boolean;
  explanation?: string;
  onContinue: () => void;
}

export function FeedbackModal({ visible, correct, explanation, onContinue }: Props) {
  const colors = useColors();
  const accent = correct ? colors.success : colors.error;
  const bg     = correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onContinue();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleContinue}
    >
      <Animated.View style={styles.overlay} entering={FadeInDown.duration(200)}>
        <TouchableOpacity style={styles.backdrop} onPress={handleContinue} activeOpacity={1} />
        <Animated.View
          entering={FadeInDown.springify().damping(16).stiffness(150)}
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderTopColor: accent },
          ]}
        >
          {/* Status row */}
          <View style={[styles.statusRow, { backgroundColor: bg, borderRadius: 10, padding: 14 }]}>
            <Animated.View entering={ZoomIn.delay(150).springify().damping(12)}>
              {correct
                ? <CheckCircle size={28} color={colors.success} strokeWidth={2} />
                : <XCircle    size={28} color={colors.error}   strokeWidth={2} />
              }
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: accent }]}>
                {correct ? "Correto!" : "Incorreto"}
              </Text>
              <Text style={[styles.statusSub, { color: colors.mutedForeground }]}>
                {correct ? "+10 XP conquistados" : "Tente revisar o conteúdo"}
              </Text>
            </View>
          </View>

          {/* Explanation */}
          {!!explanation && (
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={[
                styles.explanationBox,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.explanationLabel, { color: colors.mutedForeground }]}>
                EXPLICAÇÃO
              </Text>
              <Text style={[styles.explanationText, { color: colors.foreground }]}>
                {explanation}
              </Text>
            </Animated.View>
          )}

          {/* Continue button */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: accent }]}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>Continuar</Text>
              <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 3,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
    gap: 14,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  statusTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statusSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  explanationBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  explanationLabel: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1.5 },
  explanationText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 16,
    gap: 6,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
