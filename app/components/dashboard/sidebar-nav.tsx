import { RiSparklingFill, RiSettings4Line, RiUser3Line } from "@remixicon/react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  children?: Omit<NavItem, 'children'>[];
}

const navItems: NavItem[] = [
  { icon: RiSparklingFill, label: 'Dashboard', href: '/dashboard' },
  { 
    icon: RiSettings4Line, 
    label: 'Settings', 
    href: '/settings',
    children: [
      { icon: RiUser3Line, label: 'Profile', href: '/settings/profile' },
    ]
  }
]
