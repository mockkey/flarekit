import { RiSparklingFill } from "@remixicon/react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: RiSparklingFill, label: 'Dashboard', href: '/dashboard' },
]
