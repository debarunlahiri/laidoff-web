"use client";
import ConnectButton from "@/components/network/connect-button";
import ProfileCard from "@/components/profile/profile-card";
import { useApiResource } from "@/hooks/use-api-resource";
import ProfileTabs from "@/components/profile/profile-tabs";
import type { ApiProfile, ApiProfileStats } from "@/lib/api-types";
import { useAuth } from "@/providers/auth-provider";
import { usePlatform } from "@/providers/platform-provider";
import { MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MemberProfileView({ id }: { id: string }) {
  const { user } = useAuth();
  const { startConversation } = usePlatform();
  const router = useRouter();
  const { data, loading, error } = useApiResource<ApiProfile | null>(
    `/users/${id}`,
    null,
  );
  const stats = useApiResource<ApiProfileStats | null>(
    `/users/${id}/stats`,
    null,
  );
  const isMe = user?.id === id;

  useEffect(() => {
    if (isMe) router.replace("/profile");
  }, [isMe, router]);

  if (isMe) return null;
  if (loading && !data) return <p role="status">Loading profile…</p>;
  if (error || !data)
    return (
      <p className="empty card" role="alert">
        {error || "We couldn’t find this member."}
      </p>
    );
  return (
    <>
      <ProfileCard
        profile={{ ...data, openToWork: Boolean(data.openToWork) }}
        subtitle="Community member"
        actions={
          <>
            <ConnectButton personId={data.id} />
            <button
              className="primary"
              onClick={() => void startConversation(data.id)}
            >
              <MessageCircle size={16} /> Message
            </button>
          </>
        }
      />
      <ProfileTabs id={data.id} stats={stats.data} />
    </>
  );
}
