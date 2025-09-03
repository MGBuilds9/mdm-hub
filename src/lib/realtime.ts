import { supabase } from './supabase';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

// Realtime subscription types
export type RealtimeEvent<T extends Record<string, any> = any> =
  RealtimePostgresChangesPayload<T>;

export type RealtimeCallback<T extends Record<string, any> = any> = (
  payload: RealtimePostgresChangesPayload<T>
) => void;

// Realtime service class
export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to table changes
  subscribe<T extends Record<string, any> = Record<string, any>>(
    table: string,
    callback: RealtimeCallback<T>,
    filter?: string
  ): RealtimeChannel {
    const channelName = filter ? `${table}:${filter}` : table;

    // Remove existing channel if it exists
    this.unsubscribe(channelName);

    const channel = (supabase as any)
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        callback as any
      )
      .subscribe() as RealtimeChannel;

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to specific record changes
  subscribeToRecord<T extends Record<string, any> = Record<string, any>>(
    table: string,
    recordId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>(table, callback, `id=eq.${recordId}`);
  }

  // Subscribe to project changes
  subscribeToProject<T extends Record<string, any> = Record<string, any>>(
    projectId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>('projects', callback, `id=eq.${projectId}`);
  }

  // Subscribe to project photos
  subscribeToProjectPhotos<T extends Record<string, any> = Record<string, any>>(
    projectId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>('photos', callback, `project_id=eq.${projectId}`);
  }

  // Subscribe to project change orders
  subscribeToProjectChangeOrders<
    T extends Record<string, any> = Record<string, any>
  >(
    projectId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>(
      'change_orders',
      callback,
      `project_id=eq.${projectId}`
    );
  }

  // Subscribe to user notifications
  subscribeToUserNotifications<
    T extends Record<string, any> = Record<string, any>
  >(
    userId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>('notifications', callback, `user_id=eq.${userId}`);
  }

  // Subscribe to division changes
  subscribeToDivision<T extends Record<string, any> = Record<string, any>>(
    divisionId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>('divisions', callback, `id=eq.${divisionId}`);
  }

  // Subscribe to user changes
  subscribeToUser<T extends Record<string, any> = Record<string, any>>(
    userId: string,
    callback: RealtimeCallback<T>
  ): RealtimeChannel {
    return this.subscribe<T>('users', callback, `id=eq.${userId}`);
  }

  // Unsubscribe from a channel
  unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get channel status
  getChannelStatus(channelName: string): string | null {
    const channel = this.channels.get(channelName);
    return channel ? channel.state : null;
  }

  // Get all active channels
  getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// React hook for realtime subscriptions
export const useRealtime = () => {
  return {
    subscribe: realtimeService.subscribe.bind(realtimeService),
    subscribeToRecord: realtimeService.subscribeToRecord.bind(realtimeService),
    subscribeToProject:
      realtimeService.subscribeToProject.bind(realtimeService),
    subscribeToProjectPhotos:
      realtimeService.subscribeToProjectPhotos.bind(realtimeService),
    subscribeToProjectChangeOrders:
      realtimeService.subscribeToProjectChangeOrders.bind(realtimeService),
    subscribeToUserNotifications:
      realtimeService.subscribeToUserNotifications.bind(realtimeService),
    subscribeToDivision:
      realtimeService.subscribeToDivision.bind(realtimeService),
    subscribeToUser: realtimeService.subscribeToUser.bind(realtimeService),
    unsubscribe: realtimeService.unsubscribe.bind(realtimeService),
    unsubscribeAll: realtimeService.unsubscribeAll.bind(realtimeService),
    getChannelStatus: realtimeService.getChannelStatus.bind(realtimeService),
    getActiveChannels: realtimeService.getActiveChannels.bind(realtimeService),
  };
};

// Utility functions for common realtime patterns
export const realtimeUtils = {
  // Create a callback that updates React Query cache
  createQueryCacheCallback: <T extends Record<string, any>>(
    queryClient: any,
    queryKey: any,
    updateFn?: (oldData: T, newData: T) => T
  ) => {
    return (payload: RealtimeEvent<T>) => {
      queryClient.setQueryData(queryKey, (oldData: T) => {
        if (!oldData) return oldData;

        switch (payload.eventType) {
          case 'INSERT':
            return updateFn ? updateFn(oldData, payload.new) : payload.new;
          case 'UPDATE':
            return updateFn ? updateFn(oldData, payload.new) : payload.new;
          case 'DELETE':
            return null;
          default:
            return oldData;
        }
      });
    };
  },

  // Create a callback that invalidates React Query cache
  createInvalidationCallback: (queryClient: any, queryKey: any) => {
    return () => {
      queryClient.invalidateQueries({ queryKey });
    };
  },

  // Create a callback that shows toast notifications
  createToastCallback: (toast: any) => {
    return (payload: RealtimeEvent) => {
      const { eventType, table } = payload;
      const tableName = table
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      let message = '';
      switch (eventType) {
        case 'INSERT':
          message = `New ${tableName} created`;
          break;
        case 'UPDATE':
          message = `${tableName} updated`;
          break;
        case 'DELETE':
          message = `${tableName} deleted`;
          break;
      }

      toast({
        title: 'Real-time Update',
        description: message,
      });
    };
  },
};
