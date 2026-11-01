import {
  Bell,
  Briefcase,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  UserCheck,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import type { ApiNotification } from "@/lib/api-types";

type Meta = { label: string; icon: LucideIcon; href: string };

// Label, icon and destination for each notification type the API creates.
export function notificationMeta(item: ApiNotification): Meta {
  switch (item.type) {
    case "message":
      return { label: "Message", icon: MessageCircle, href: "/messages" };
    case "connection":
      return { label: "Connection request", icon: UserPlus, href: "/network" };
    case "connection_accepted":
      return {
        label: "Connection accepted",
        icon: UserCheck,
        href: "/network",
      };
    case "like":
      return { label: "Like", icon: ThumbsUp, href: "/" };
    case "comment":
      return { label: "Comment", icon: MessageSquare, href: "/" };
    case "referral_request":
      return {
        label: "Referral request",
        icon: Briefcase,
        href: item.resourceId ? `/referrals/${item.resourceId}` : "/referrals",
      };
    case "referral_update":
      return {
        label: "Referral update",
        icon: Briefcase,
        href: item.resourceId ? `/referrals/${item.resourceId}` : "/referrals",
      };
    default:
      return { label: "Notification", icon: Bell, href: "/" };
  }
}
