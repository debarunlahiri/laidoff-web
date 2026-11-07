import {
  Briefcase, Flame, Heart, Lightbulb, Megaphone, Rocket, Star, Sparkles, Users,
  TrendingDown, TrendingUp, Zap, BookOpen, Coffee, Globe, GraduationCap, Handshake,
  Hash, Shield, Target, Trophy, Wallet, Building2, MessageCircle,
  type LucideIcon,
} from "lucide-react";

/** Curated icon set an admin can attach to a hashtag (stored by name). */
export const TAG_ICONS: Record<string, LucideIcon> = {
  briefcase: Briefcase, flame: Flame, heart: Heart, lightbulb: Lightbulb,
  megaphone: Megaphone, rocket: Rocket, star: Star, sparkles: Sparkles,
  users: Users, "trending-down": TrendingDown, "trending-up": TrendingUp,
  zap: Zap, "book-open": BookOpen, coffee: Coffee, globe: Globe,
  "graduation-cap": GraduationCap, handshake: Handshake, shield: Shield,
  target: Target, trophy: Trophy, wallet: Wallet, "building-2": Building2,
  "message-circle": MessageCircle,
};
export const tagIcon = (name?: string): LucideIcon => TAG_ICONS[name ?? ""] ?? Hash;

export const EMOJI_SUGGESTIONS = [
  "🔥","💼","📉","📈","🚀","💡","🤝","❤️","🙏","🎯","📣","⚡","🌍","🎓","💰","🏢",
  "😔","💪","🧠","✨","🏆","🛡️","☕","📚","🔔","⚠️","✅","🧑‍💻","📝","🔍","🌱","🎉",
];
