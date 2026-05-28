import { Platform } from 'react-native';
import Constants from 'expo-constants';

const isExpoGo = Constants.appOwnership === 'expo';

export const notificationService = {
  async setupNotificationsAsync(): Promise<void> {
    if (Platform.OS === 'web' || isExpoGo) return;
    try {
      const Notifications = await import('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (err) {
      console.warn("Error setting up notification handler:", err);
    }
  },

  async requestPermissionsAsync(): Promise<boolean> {
    if (Platform.OS === 'web' || isExpoGo) {
      if (isExpoGo) {
        console.log("[notificationService] Push notifications bypass on Expo Go.");
      }
      return false;
    }
    try {
      const Notifications = await import('expo-notifications');
      const { status: existingStatus } = await Notifications.getPermissionsAsync() as any;
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync() as any;
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch (err) {
      console.warn("Error requesting notification permissions:", err);
      return false;
    }
  },

  async scheduleDailyStreakReminder(): Promise<void> {
    if (Platform.OS === 'web' || isExpoGo) return;
    try {
      const hasPermission = await this.requestPermissionsAsync();
      if (!hasPermission) return;

      // Primeiro, limpamos agendamentos antigos para evitar notificações duplicadas
      await this.cancelAllReminders();

      const Notifications = await import('expo-notifications');

      // Programamos um lembrete para 24 horas no futuro
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔥 Proteja sua Ofensiva!",
          body: "ACK-ADMY: Um dia sem treinar é um dia a mais de vulnerabilidade. Dedique 2 minutinhos para estudar hoje!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 24 * 60 * 60, // 24 horas
        },
      });
      console.log("Daily study reminder scheduled successfully (24h)!");
    } catch (err) {
      console.warn("Error scheduling study reminder:", err);
    }
  },

  async cancelAllReminders(): Promise<void> {
    if (Platform.OS === 'web' || isExpoGo) return;
    try {
      const Notifications = await import('expo-notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All study reminders cleared.");
    } catch (err) {
      console.warn("Error cancelling reminders:", err);
    }
  }
};
