"use client";
import { useState } from "react";
import { api, apiMessage, invalidate } from "@/lib/api";
import type { ApiPerson, ApiConnection } from "@/lib/api-types";
import { toPerson } from "@/lib/person-mapper";
import type { Person } from "@/types";
import { useConfirm } from "@/providers/confirm-provider";
import { useApiList, useApiResource } from "./use-api-resource";
export function useNetwork(notify: (message: string) => void, userId: string) {
  const confirm = useConfirm();
  const stats = useApiResource<{
    connections: number;
    following: number;
    outgoingRequests: number;
    incomingRequests: number;
  }>(userId ? "/network/stats" : null, {
    connections: 0,
    following: 0,
    outgoingRequests: 0,
    incomingRequests: 0,
  });
  const users = useApiList<ApiPerson>("/users");
  const links = useApiList<ApiConnection>(userId ? "/connections" : null);
  const [pending, setPending] = useState<string[]>([]);
  const following = users.data
    .filter((person) => person.following)
    .map((person) => person.id);
  const connected = links.data.map((link) =>
    link.requester_id === userId ? link.recipient_id : link.requester_id,
  );
  const people: Person[] = users.data.map(toPerson);
  async function act(id: string, action: () => Promise<unknown>) {
    if (pending.includes(id)) return;
    setPending((current) => [...current, id]);
    try {
      await action();
      invalidate("users", "connections", "network", "posts");
    } catch (error) {
      notify(apiMessage(error));
    } finally {
      setPending((current) => current.filter((item) => item !== id));
    }
  }
  async function toggleConnection(id: string) {
    const existing = links.data.find(
      (link) =>
        (link.requester_id === userId
          ? link.recipient_id
          : link.requester_id) === id,
    );
    if (
      existing &&
      !(await confirm({
        title: "Remove this connection?",
        message:
          "This removes the connection, or cancels the request if it is still pending.",
        confirmLabel: "Remove",
        tone: "danger",
      }))
    )
      return;
    return act(id, () =>
      existing
        ? api(`/connections/${existing.id}`, { method: "DELETE" })
        : api("/connections", { method: "POST", body: { userId: id } }),
    );
  }
  return {
    networkStats: stats.data,
    people,
    following,
    connected,
    connections: links.data,
    networkPending: pending,
    toggleConnection,
    toggleFollow: async (id: string, current?: boolean) => {
      const unfollow = current ?? following.includes(id);
      if (
        unfollow &&
        !(await confirm({
          title: "Unfollow this person?",
          message: "Their posts will no longer appear in your Following feed.",
          confirmLabel: "Unfollow",
          tone: "danger",
        }))
      )
        return;
      return act(id, () =>
        api(`/users/${id}/follow`, { method: unfollow ? "DELETE" : "PUT" }),
      );
    },
    acceptConnection: (id: string) =>
      act(id, () =>
        api(`/connections/${id}`, {
          method: "PATCH",
          body: { status: "accepted" },
        }),
      ),
    networkLoading: users.loading || links.loading,
    networkError: users.error || links.error,
    peopleHasMore: users.hasMore,
    loadMorePeople: users.loadMore,
    connectionsHasMore: links.hasMore,
    loadMoreConnections: links.loadMore,
  };
}
