import {
  LayoutGrid,
  MessageSquare,
  ShieldCheck,
  User,
  Video,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  requiresAdmin?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { id: "discover", label: "Discover", path: "/discover", icon: LayoutGrid },
  { id: "room", label: "Silent Room", path: "/room", icon: Video },
  { id: "forum", label: "Group Forum", path: "/forum", icon: MessageSquare },
  {
    id: "admin",
    label: "Admin Console",
    path: "/admin",
    icon: ShieldCheck,
    requiresAdmin: true,
  },
  { id: "profile", label: "Profile", path: "/profile", icon: User },
];
