import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { AlertTriangle, Mail, Paperclip, ExternalLink, User, Flag, MessageSquare } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import type { PhishingEmailExercise, PhishingElementDef } from "@/constants/lessons";

interface Props {
  exercise: PhishingEmailExercise;
  onAnswer: (correct: boolean, userAnswer?: any) => void;
  feedbackVisible?: boolean;
  powerUpUsed?: boolean;
}

export function PhishingSimulatorScreen({ exercise, onAnswer, feedbackVisible = false, powerUpUsed = false }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  
  const [flagged, setFlagged] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const locked = checked || feedbackVisible;
  
  // Extract data with fallbacks for legacy format if any
  const elements = exercise.phishingElements || [];
  const correctIds = exercise.correctElementIds || [];
  
  React.useEffect(() => {
    if (powerUpUsed && correctIds.length > 0) {
      // Find the first suspicious item not yet flagged
      const firstMissed = correctIds.find((id) => !flagged.includes(id));
      if (firstMissed) {
        setFlagged((prev) => [...prev, firstMissed]);
      }
    }
  }, [powerUpUsed, exercise]);

  const toggle = (id: string) => {
    if (locked) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFlagged((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const canCheck = flagged.length > 0 && !locked;

  const handleCheck = () => {
    if (!canCheck) return;
    setChecked(true);
    
    // Validar: todos os corretos foram marcados E nenhum incorreto foi marcado
    const hasAllCorrect = correctIds.every((id) => flagged.includes(id));
    const hasNoIncorrect = flagged.every((id) => correctIds.includes(id));
    
    const passed = hasAllCorrect && hasNoIncorrect;
    onAnswer(passed, flagged);
  };

  const renderElement = (el: PhishingElementDef) => {
    const isSelected = flagged.includes(el.id);
    const isSuspicious = correctIds.includes(el.id);
    
    let bg = colors.card;
    let border = colors.border;
    let iconColor = colors.mutedForeground;
    let textColor = colors.foreground;
    
    if (!checked) {
      if (isSelected) {
        bg = "rgba(239,68,68,0.12)"; // Red tint
        border = "#EF4444";
        iconColor = "#EF4444";
        textColor = "#EF4444";
      }
    } else {
      if (isSelected && isSuspicious) {
        // Correct hit
        bg = "rgba(16,185,129,0.12)"; // Green tint
        border = "#10B981";
        iconColor = "#10B981";
        textColor = "#10B981";
      } else if (isSelected && !isSuspicious) {
        // False positive
        bg = "rgba(245,158,11,0.12)"; // Orange tint
        border = "#F59E0B";
        iconColor = "#F59E0B";
        textColor = "#F59E0B";
      } else if (!isSelected && isSuspicious) {
        // Missed hit
        bg = "rgba(245,158,11,0.12)"; // Orange tint
        border = "#F59E0B";
        iconColor = "#F59E0B";
        textColor = colors.foreground;
      }
    }

    // Determine icon based on ID keyword
    let IconComp = MessageSquare;
    if (el.id.includes("sender")) IconComp = User;
    else if (el.id.includes("link")) IconComp = ExternalLink;
    else if (el.id.includes("attachment")) IconComp = Paperclip;

    return (
      <View key={el.id} style={{ marginBottom: 12 }}>
        <TouchableOpacity
          style={[styles.zone, { backgroundColor: bg, borderColor: border }]}
          onPress={() => toggle(el.id)}
          activeOpacity={0.7}
          disabled={locked}
        >
          <View style={styles.zoneRow}>
            <IconComp size={16} color={iconColor} strokeWidth={2} />
            <Text style={[styles.elLabel, { color: textColor }]}>
              {el.label}
            </Text>
            {isSelected && <Flag size={14} color={iconColor} strokeWidth={2} />}
          </View>
        </TouchableOpacity>
        
        {/* Item-specific feedback visible only after checking */}
        {checked && (isSelected || isSuspicious) && (
          <View style={[styles.itemFeedback, { backgroundColor: colors.muted }]}>
            <Text style={[styles.itemFeedbackText, { color: colors.foreground }]}>
              {isSelected && isSuspicious ? "✅ " : isSelected && !isSuspicious ? "⚠️ Falso positivo: " : "❌ Passou despercebido: "}
              {el.feedback}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 150 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.instructionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.instruction, { color: colors.foreground }]}>
            Toque nos sinais suspeitos e deixe os neutros em branco.
          </Text>
          <Text style={[styles.subInstruction, { color: colors.mutedForeground }]}>
            Selecione apenas os elementos que indicam risco real.
          </Text>
        </View>

        <View style={[styles.emailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Toolbar */}
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <Mail size={14} color={colors.mutedForeground} strokeWidth={2} />
            <Text style={[styles.toolbarText, { color: colors.mutedForeground }]}>Caixa de Entrada</Text>
          </View>

          {/* Header */}
          <View style={styles.emailHeader}>
            <Text style={[styles.subject, { color: colors.foreground }]}>{exercise.subject}</Text>
          </View>

          {/* Body with generic elements */}
          <View style={[styles.emailBody, { borderTopColor: colors.border }]}>
            {elements.map(renderElement)}
          </View>
        </View>
      </ScrollView>

      {!feedbackVisible && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: canCheck ? colors.primary : colors.muted, opacity: canCheck ? 1 : 0.6 }]}
            onPress={handleCheck}
            activeOpacity={0.85}
            disabled={!canCheck}
          >
            <Text style={[styles.btnText, { color: canCheck ? "#FFFFFF" : colors.mutedForeground }]}>
              Confirmar análise
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 24, gap: 16, paddingBottom: 32 },
  instructionCard: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 8 },
  instruction: { fontSize: 16, fontFamily: "Inter_600SemiBold", lineHeight: 24 },
  subInstruction: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  emailCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  emailHeader: { padding: 20 },
  subject: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 24 },
  emailBody: { padding: 20, borderTopWidth: 1 },
  zone: { borderRadius: 12, borderWidth: 1.5, padding: 14 },
  zoneRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  elLabel: { fontSize: 14, fontFamily: "Inter_500Medium", flex: 1, lineHeight: 20 },
  itemFeedback: {
    marginTop: 6,
    padding: 12,
    borderRadius: 8,
  },
  itemFeedbackText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 20 },
  footer: { paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1 },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16, fontFamily: "Inter_700Bold", letterSpacing: 0.2 },
});
