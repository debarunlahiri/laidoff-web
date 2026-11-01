"use client";
import ProfileCard from "@/components/profile/profile-card";
import ProfileEditDialog from "@/components/profile/profile-edit-dialog";
import { useProfileImageControls } from "@/components/profile/profile-image-controls";
import ProfileTabs from "@/components/profile/profile-tabs";
import { useApiResource } from "@/hooks/use-api-resource";
import type { ApiProfileStats } from "@/lib/api-types";
import { useAuth } from "@/providers/auth-provider";
import { Pencil } from "lucide-react";
import { useState } from "react";

export default function ProfileView() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const imageControls = useProfileImageControls();
  const stats = useApiResource<ApiProfileStats | null>(
    user ? `/users/${user.id}/stats` : null,
    null,
  );
  if (!user) return null;
  return (
    <>
      <ProfileCard
        profile={user}
        subtitle={user.email}
        coverControls={imageControls.coverControls}
        avatarControls={imageControls.avatarControls}
        actions={
          <button className="primary" onClick={() => setEditing(true)}>
            <Pencil size={15} /> Edit profile
          </button>
        }
      >
        {imageControls.dialog}
        {editing && <ProfileEditDialog onClose={() => setEditing(false)} />}
      </ProfileCard>
      <ProfileTabs id={user.id} stats={stats.data} own />
    </>
  );
}
