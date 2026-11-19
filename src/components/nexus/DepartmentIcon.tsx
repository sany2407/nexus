"use client";

import {
  Boxes,
  BrainCircuit,
  ChefHat,
  ClipboardList,
  ConciergeBell,
  CreditCard,
  Landmark,
  Crown,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/types/nexus";

export const departmentIcons: Record<IconKey, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  boxes: Boxes,
  "utensils-crossed": UtensilsCrossed,
  "clipboard-list": ClipboardList,
  "chef-hat": ChefHat,
  "concierge-bell": ConciergeBell,
  "credit-card": CreditCard,
  users: Users,
  "user-cog": UserCog,
  truck: Truck,
  landmark: Landmark,
  crown: Crown,
  "brain-circuit": BrainCircuit,
};

interface DepartmentIconProps {
  icon: IconKey;
  className?: string;
  strokeWidth?: number;
}

export function DepartmentIcon({
  icon,
  className,
  strokeWidth = 1.6,
}: DepartmentIconProps) {
  const Icon = departmentIcons[icon];
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
