import { RiSparklingFill, RiSettings4Line, RiUser3Line, RiSettings2Fill, RiBankCard2Fill } from "@remixicon/react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  children?: Omit<NavItem, 'children'>[];
}

export const navItems: NavItem[] = [
  { icon: RiSparklingFill, label: 'Dashboard', href: '/dashboard' },
  { 
    icon: RiSettings4Line, 
    label: 'Settings', 
    href: '/settings',
  },
  { 
    icon: RiBankCard2Fill, 
    label: 'Billing', 
    href: '/billing',
  }
]
