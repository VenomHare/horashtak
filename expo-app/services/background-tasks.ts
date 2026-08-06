import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { horaDetector } from '@/lib/hora-detector';
import { setCachedHoraDay } from '@/services/cache';
import { refreshHoraNotifications } from '@/services/notifications';
import { syncWidgetSnapshot } from '@/services/widget-sync';
import { getCurrentCoordinates } from '@/services/permissions';
import { useAppStore } from '@/store/app-store';

export const HORA_RECALCULATION_TASK = 'hora-recalculation-task';
export const WIDGET_UPDATE_TASK = 'widget-update-task';

// Background task for recalculating hora data
TaskManager.defineTask(HORA_RECALCULATION_TASK, async ({ error }) => {
  if (error) {
    console.error('Hora recalculation task error:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  try {
    console.log('Starting hora recalculation at:', new Date().toISOString());

    const coordinates = await getCurrentCoordinates();
    const now = new Date();
    const showRahuKetu = useAppStore.getState().showRahuKetu;
    const horaDay = await horaDetector.getHoraDay(coordinates, now, showRahuKetu);

    // Cache the new data
    await setCachedHoraDay(horaDay);

    // Get current preferences from store
    const state = useAppStore.getState();
    const language = state.language;
    const highlightedHoras = state.highlightedHoras;

    // Update widgets
    await syncWidgetSnapshot(horaDay, highlightedHoras, language);

    // Update notifications
    await refreshHoraNotifications(horaDay, language);

    console.log('Hora recalculation completed at:', new Date().toISOString());
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (taskError) {
    console.error('Hora recalculation execution error:', taskError);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// Background task for updating widgets
TaskManager.defineTask(WIDGET_UPDATE_TASK, async ({ error }) => {
  if (error) {
    console.error('Widget update task error:', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }

  try {
    console.log('Starting widget update at:', new Date().toISOString());

    // Get cached data if available
    const { getCachedHoraDay } = await import('@/services/cache');
    const cachedDay = await getCachedHoraDay();

    if (cachedDay) {
      const state = useAppStore.getState();
      const language = state.language;
      const highlightedHoras = state.highlightedHoras;

      await syncWidgetSnapshot(cachedDay, highlightedHoras, language);
      console.log('Widget update completed at:', new Date().toISOString());
      return BackgroundTask.BackgroundTaskResult.Success;
    } else {
      console.log('No cached data available for widget update');
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  } catch (taskError) {
    console.error('Widget update execution error:', taskError);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function scheduleBackgroundTasks() {
  if (Platform.OS === 'android' && Constants.appOwnership !== 'expo') {
    try {
      // Register hora recalculation task (runs every 30 minutes)
      await BackgroundTask.registerTaskAsync(HORA_RECALCULATION_TASK, {
        minimumInterval: 30 * 60 * 1000, // 30 minutes
      });
      console.log('Registered hora recalculation task');

      // Register widget update task (runs every 15 minutes)
      await BackgroundTask.registerTaskAsync(WIDGET_UPDATE_TASK, {
        minimumInterval: 15 * 60 * 1000, // 15 minutes
      });
      console.log('Registered widget update task');
    } catch (error) {
      console.warn('Failed to register background tasks:', error);
    }
  }
}

export async function unregisterBackgroundTasks() {
  if (Platform.OS === 'android' && Constants.appOwnership !== 'expo') {
    try {
      await BackgroundTask.unregisterTaskAsync(HORA_RECALCULATION_TASK);
      console.log('Unregistered hora recalculation task');

      await BackgroundTask.unregisterTaskAsync(WIDGET_UPDATE_TASK);
      console.log('Unregistered widget update task');
    } catch (error) {
      console.warn('Failed to unregister background tasks:', error);
    }
  }
}

// Schedule background tasks at module load time (not tied to component lifecycle)
// This ensures tasks are registered when the app starts, even in background
scheduleBackgroundTasks().catch((error) => {
  console.warn('Failed to schedule background tasks during bootstrap:', error);
});