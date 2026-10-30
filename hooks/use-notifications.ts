"use client";
import { api, apiMessage, invalidate } from "@/lib/api";
import type { ApiNotification } from "@/lib/api-types";
import { useApiList, useApiResource } from "./use-api-resource";
export function useNotifications(notify: (message: string) => void) {
  const summary = useApiResource<{ unread: number; unreadMessages: number }>(
    "/notifications/summary",
    { unread: 0, unreadMessages: 0 },
    20000,
  );
  const list = useApiList<ApiNotification>("/notifications", 20000);
  async function markNotificationRead(id?: string) {
    try {
      await api(id ? `/notifications/${id}/read` : "/notifications/read", {
        method: "PUT",
      });
      invalidate("notifications");
    } catch (error) {
      notify(apiMessage(error));
    }
  }
  return {
    notificationItems: list.data,
    notificationCount: Number(summary.data.unread),
    unreadMessageCount: Number(summary.data.unreadMessages),
    notificationsLoading: list.loading,
    notificationsError: list.error,
    notificationsHasMore: list.hasMore,
    loadMoreNotifications: list.loadMore,
    markNotificationRead,
  };
}
