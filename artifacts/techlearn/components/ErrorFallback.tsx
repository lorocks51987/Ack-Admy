import { reloadAppAsync } from "expo";
import React, { useState } from "react";
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AlertCircle, X, RefreshCw } from "lucide-react-native";

import { useColors } from "@/hooks/useColors";

export type ErrorFallbackProps = {
  error: Error;
  resetError: () => void;
};

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRestart = async () => {
    try {
      await reloadAppAsync();
    } catch {
      resetError();
    }
  };

  const monoFont = Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {__DEV__ && (
        <Pressable
          onPress={() => setIsModalVisible(true)}
          style={({ pressed }) => [styles.topButton, { top: insets.top + 16, backgroundColor: colors.card, opacity: pressed ? 0.8 : 1 }]}
        >
          <AlertCircle size={20} color={colors.error} strokeWidth={2} />
        </Pressable>
      )}

      <View style={styles.content}>
        <AlertCircle size={48} color={colors.error} strokeWidth={1.5} />
        <Text style={[styles.title, { color: colors.foreground }]}>Algo deu errado</Text>
        <Text style={[styles.message, { color: colors.mutedForeground }]}>
          Recarregue o app para continuar.
        </Text>
        {__DEV__ && (
          <Text style={[styles.devError, { color: colors.error, fontFamily: monoFont }]} numberOfLines={3}>
            {error.message}
          </Text>
        )}
        <Pressable
          onPress={handleRestart}
          style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 }]}
        >
          <RefreshCw size={16} color="#FFFFFF" strokeWidth={2} />
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </Pressable>
      </View>

      {__DEV__ && (
        <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Detalhes do Erro</Text>
                <Pressable onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                  <X size={24} color={colors.foreground} strokeWidth={2} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalScrollView} contentContainerStyle={[styles.modalScrollContent, { paddingBottom: insets.bottom + 16 }]} showsVerticalScrollIndicator>
                <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
                  <Text style={[styles.errorText, { color: colors.foreground, fontFamily: monoFont }]} selectable>
                    {`Error: ${error.message}\n\n${error.stack ?? ""}`}
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", padding: 24 },
  topButton: { position: "absolute", right: 16, width: 44, height: 44, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", zIndex: 10 },
  content: { alignItems: "center", justifyContent: "center", gap: 16, width: "100%", maxWidth: 400 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  message: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  devError: { fontSize: 11, padding: 12, borderRadius: 6, backgroundColor: "rgba(239,68,68,0.1)", width: "100%", lineHeight: 16 },
  button: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14, borderRadius: 8, paddingHorizontal: 28, minWidth: 180, justifyContent: "center" },
  buttonText: { fontWeight: "700", textAlign: "center", fontSize: 15, color: "#FFFFFF" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContainer: { width: "100%", height: "90%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "600" },
  closeButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  modalScrollView: { flex: 1 },
  modalScrollContent: { padding: 16 },
  errorContainer: { width: "100%", borderRadius: 8, overflow: "hidden", padding: 16 },
  errorText: { fontSize: 11, lineHeight: 18, width: "100%" },
});
