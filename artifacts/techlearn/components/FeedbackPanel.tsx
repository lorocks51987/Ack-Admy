import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { CheckCircle, XCircle, BookOpen, AlertCircle, ChevronRight, Heart } from "lucide-react-native";
import Reanimated, { Easing, FadeInDown, FadeIn } from "react-native-reanimated";

export type FeedbackState = {
  visible: boolean;
  correct: boolean;
  message: string;
  learnMore?: string;
  userAnswer?: string;
  showLearnMore?: boolean;
};

interface FeedbackPanelProps {
  feedback: FeedbackState;
  colors: any;
  lives: number;
  maxLives: number;
  insets: any;
  retryTextInput?: boolean;
  onContinue: () => void;
  onToggleLearnMore: () => void;
  onConfront?: () => void;
}

export function FeedbackPanel({
  feedback, colors, lives, maxLives, insets, onContinue, onToggleLearnMore, onConfront, retryTextInput,
}: FeedbackPanelProps) {
  const accent = feedback.correct ? colors.success : colors.error;
  const statusBg = feedback.correct ? "rgba(34,197,94,0.09)" : "rgba(239,68,68,0.09)";
  const safeBottom = Math.max(insets.bottom, Platform.OS === 'web' ? 24 : 16);

  return (
    <Reanimated.View 
      entering={FadeInDown.duration(200).easing(Easing.out(Easing.quad))}
      style={[fb.panel, { backgroundColor: colors.card, borderTopColor: accent, paddingBottom: safeBottom }]}
    >
      {/* Status row */}
      <View style={[fb.statusRow, { backgroundColor: statusBg, borderRadius: 12, padding: 14 }]}>
        <Reanimated.View entering={FadeIn.duration(200).delay(50)}>
          {feedback.correct
            ? <CheckCircle size={26} color={colors.success} strokeWidth={2} />
            : <XCircle size={26} color={colors.error} strokeWidth={2} />
          }
        </Reanimated.View>
        <View style={{ flex: 1 }}>
          <Text style={[fb.statusTitle, { color: accent }]}>
            {feedback.correct ? "Boa!" : "Quase."}
          </Text>
          <Text style={[fb.statusMsg, { color: colors.foreground }]}>
            {feedback.message}
          </Text>
        </View>
        {/* Remaining lives on error */}
        {!feedback.correct && (
          <View style={fb.livesCol}>
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                size={12}
                color={i < lives ? "#EF4444" : colors.border}
                strokeWidth={2}
                fill={i < lives ? "#EF4444" : "transparent"}
              />
            ))}
          </View>
        )}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginVertical: 4 }}>
        {feedback.learnMore && (
          <TouchableOpacity
            style={[fb.learnMoreBtn, { borderColor: colors.border }]}
            onPress={onToggleLearnMore}
            activeOpacity={0.8}
          >
            <BookOpen size={13} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[fb.learnMoreText, { color: colors.mutedForeground }]} adjustsFontSizeToFit={true} numberOfLines={1}>
              {feedback.correct ? "Saiba mais" : "Entender o erro"}
            </Text>
          </TouchableOpacity>
        )}
        
        {!feedback.correct && onConfront && (
          <TouchableOpacity
            style={[fb.learnMoreBtn, { borderColor: colors.border }]}
            onPress={onConfront}
            activeOpacity={0.8}
          >
            <AlertCircle size={13} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[fb.learnMoreText, { color: colors.mutedForeground }]} adjustsFontSizeToFit={true} numberOfLines={1}>
              Confrontar resposta
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action button */}
      <TouchableOpacity
        style={[fb.primaryBtn, { backgroundColor: feedback.correct ? colors.success : colors.primary }]}
        onPress={onContinue}
        activeOpacity={0.85}
      >
        <Text style={fb.primaryBtnText} adjustsFontSizeToFit={true} numberOfLines={1}>
          {feedback.correct ? "Continuar" : (retryTextInput ? "Tentar novamente" : "Continuar")}
        </Text>
        <ChevronRight size={18} color="#FFF" strokeWidth={2.5} />
      </TouchableOpacity>
    </Reanimated.View>
  );
}

const fb = StyleSheet.create({
  panel: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    borderTopWidth: 3, padding: 24, gap: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 12, elevation: 10,
    zIndex: 100,
  },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  statusTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 2 },
  statusMsg: { fontSize: 14, fontFamily: "Inter_400Regular", opacity: 0.9 },
  livesCol: { flexDirection: "column", gap: 4, alignItems: "center", justifyContent: "center" },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    padding: 16, borderRadius: 12, gap: 8, minHeight: 52,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_700Bold" },
  learnMoreBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, backgroundColor: "transparent",
  },
  learnMoreText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
