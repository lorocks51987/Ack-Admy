import React, { useState } from "react";
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform
} from "react-native";
import { X, Shield } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/services/supabaseClient";
import * as Haptics from "expo-haptics";

interface FeedbackFormModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
  course: string | null;
  term: string | null;
  room: string | null;
  className: string | null;
  onSuccess: () => void;
}

/** Componente de linha de escudos para a avaliação geral */
function ShieldRatingRow({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const colors = useColors();
  return (
    <View style={s.ratingField}>
      <Text style={[s.label, { color: colors.foreground, textAlign: "center", marginBottom: 6 }]}>
        Como você avalia sua experiência?
      </Text>
      <View style={s.shieldsRow}>
        {[1, 2, 3, 4, 5].map((num) => {
          const active = num <= (value ?? 0);
          return (
            <TouchableOpacity
              key={num}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(num);
              }}
              hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Shield
                size={36}
                color={active ? colors.primary : colors.border}
                fill={active ? colors.primary : "transparent"}
                strokeWidth={1.8}
              />
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={{ fontSize: 11, fontFamily: "Inter_400Regular", color: colors.mutedForeground, textAlign: "center", marginTop: 4 }}>
        Toque nos escudos para dar sua nota.
      </Text>
    </View>
  );
}

export function FeedbackFormModal({
  visible, onClose, userId, userName, userEmail, course, term, room, className, onSuccess
}: FeedbackFormModalProps) {
  const colors = useColors();

  const [rating, setRating] = useState<number | null>(null);
  const [likedMost, setLikedMost] = useState("");
  const [improvementSuggestion, setImprovementSuggestion] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === null) {
      setError("Escolha uma nota de 1 a 5 escudos para continuar.");
      return;
    }
    setLoading(true);
    setError(null);

    // Mapeamento automático de recomendação baseado na nota do escudo
    let autoRec: "Sim" | "Talvez" | "Não" = "Sim";
    if (rating === 3) {
      autoRec = "Talvez";
    } else if (rating <= 2) {
      autoRec = "Não";
    }

    try {
      const { error: insertError } = await supabase.from("feedbacks").insert({
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        course,
        term,
        room,
        class_name: className,
        rating_usability: rating,
        rating_clarity: rating,
        rating_exercises: rating,
        rating_feedback: rating,
        rating_return: rating,
        recommendation: autoRec,
        liked_most: likedMost.trim() || null,
        confused_most: null, // "O que você não gostou?" removido no novo formulário simplificado
        improvement_suggestion: improvementSuggestion.trim() || null,
      });

      if (insertError) throw insertError;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        // Reset states para futuras aberturas
        setRating(null);
        setLikedMost("");
        setImprovementSuggestion("");
        setSuccess(false);
      }, 2200);
    } catch (err: any) {
      console.warn("Error submitting feedback:", err);
      setError("Não foi possível enviar o feedback. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%", maxHeight: "90%" }}
        >
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={[s.title, { color: colors.foreground }]}>Feedback da experiência</Text>
                <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
                  Sua opinião ajuda a melhorar o ACK-ADMY.
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={s.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {success ? (
              <View style={[s.successBox, { backgroundColor: colors.success + "15" }]}>
                <Shield size={36} color={colors.success} fill={colors.success} />
                <Text style={[s.successText, { color: colors.success }]}>
                  Obrigado pelo feedback. Sua opinião ajuda a melhorar o ACK-ADMY.
                </Text>
              </View>
            ) : (
              <ScrollView
                style={s.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24, gap: 20 }}
                keyboardShouldPersistTaps="handled"
              >
                {error && (
                  <Text style={[s.errorText, { color: colors.error }]}>{error}</Text>
                )}

                {/* Seção de escudos */}
                <View style={s.section}>
                  <ShieldRatingRow
                    value={rating}
                    onChange={(v) => {
                      setError(null);
                      setRating(v);
                    }}
                  />
                </View>

                {/* Perguntas abertas */}
                <View style={s.section}>
                  <View style={s.field}>
                    <Text style={[s.label, { color: colors.foreground }]}>O que você gostou?</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                      multiline
                      numberOfLines={3}
                      value={likedMost}
                      onChangeText={setLikedMost}
                      placeholder="Opcional..."
                      placeholderTextColor={colors.mutedForeground}
                      maxLength={200}
                    />
                  </View>

                  <View style={s.field}>
                    <Text style={[s.label, { color: colors.foreground }]}>O que você melhoraria?</Text>
                    <TextInput
                      style={[s.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                      multiline
                      numberOfLines={3}
                      value={improvementSuggestion}
                      onChangeText={setImprovementSuggestion}
                      placeholder="Opcional..."
                      placeholderTextColor={colors.mutedForeground}
                      maxLength={200}
                    />
                  </View>
                </View>

                {/* Botões */}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={[s.btnCancel, { borderColor: colors.border }]}
                    onPress={onClose}
                    disabled={loading}
                  >
                    <Text style={[s.btnCancelText, { color: colors.foreground }]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.btnSubmit,
                      { backgroundColor: colors.primary },
                      loading && s.disabledBtn,
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={s.btnSubmitText}>Enviar feedback</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4 },
  closeBtn: { padding: 4 },

  scroll: { flexGrow: 0 },

  section: { gap: 14 },

  // Shield rating field
  ratingField: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  label: { fontSize: 14, fontFamily: "Inter_500Medium" },
  shieldsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  // Open questions
  field: { gap: 6 },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 74,
    textAlignVertical: "top",
  },

  // Actions
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  btnCancel: {
    flex: 1, height: 48, borderRadius: 10, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  btnCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  btnSubmit: {
    flex: 1, height: 48, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  btnSubmitText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  disabledBtn: { opacity: 0.45 },

  errorText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  successBox: {
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginBottom: 24,
  },
  successText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 24,
  },
});
