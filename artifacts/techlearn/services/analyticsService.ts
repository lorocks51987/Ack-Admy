import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import { supabase } from "@/services/supabaseClient";

const DEVICE_ID_KEY = "@ackadmy:analytics:device_id";

class AnalyticsService {
  private deviceId: string | null = null;
  private sessionId: string | null = null;
  private userId: string | null = null;
  private isGuest: boolean = true;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
        if (!storedDeviceId) {
          storedDeviceId = Crypto.randomUUID();
          await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
        }
        this.deviceId = storedDeviceId;
        this.sessionId = Crypto.randomUUID();
        this.isInitialized = true;

        // Dispara eventos iniciais
        this.track("app_open");
        this.track("session_start");
      } catch (e) {
        console.warn("Analytics initialization failed", e);
      }
    })();

    return this.initPromise;
  }

  setSessionUser(userId: string | null, isGuest: boolean) {
    this.userId = userId;
    this.isGuest = isGuest;
  }

  track(eventName: string, metadata: Record<string, any> = {}) {
    if (!this.isInitialized) {
      // Se ainda não inicializou, aguarda a inicialização para enviar
      this.initialize().then(() => this._dispatch(eventName, metadata));
      return;
    }
    this._dispatch(eventName, metadata);
  }

  private async _dispatch(eventName: string, metadata: Record<string, any>) {
    try {
      // Extrai module_id e lesson_id caso venham no metadata para preencher colunas
      const { module_id, lesson_id, ...restMetadata } = metadata;
      
      const payload = {
        event_name: eventName,
        user_id: this.userId,
        session_id: this.sessionId,
        device_id: this.deviceId,
        is_guest: this.isGuest,
        module_id: module_id || null,
        lesson_id: lesson_id || null,
        metadata: restMetadata,
      };

      // Disparos assíncronos não bloqueantes (fire and forget). V1 sem batching.
      supabase.from("analytics_events").insert([payload]).then(({ error }) => {
        if (error) {
          console.warn("[Analytics] Supabase Error:", error.message);
        }
      });
    } catch (e) {
      console.warn("[Analytics] Dispatch exception:", e);
    }
  }

  // Helper para encerrar sessão e gerar nova (ex: caso volte de background muito tempo depois)
  cycleSession() {
    this.track("session_end");
    this.sessionId = Crypto.randomUUID();
    this.track("session_start");
  }
}

export const analyticsService = new AnalyticsService();
