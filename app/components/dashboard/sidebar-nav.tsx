import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@flarekit/ui/components/ui/sidebar";
import {
  RiSparklingFill,
  RiSettings4Line,
  RiBankCard2Fill,
} from "@remixicon/react";
import { Link } from "react-router";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  children?: Omit<NavItem, "children">[];
}

export const navItems: NavItem[] = [
  { icon: RiSparklingFill, label: "Dashboard", href: "/dashboard" },
  {
    icon: RiSettings4Line,
    label: "Settings",
    href: "/settings",
  },
  {
    icon: RiBankCard2Fill,
    label: "Billing",
    href: "/billing",
  },
];

export default function SidebarNav({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-slate-50 dark:bg-slate-900 border-r transition-all duration-300"
    >
      <SidebarHeader className="flex flex-row h-16 items-center gap-2 px-2 border-b">
        <RiSparklingFill className="text-primary size-8" />
        {open && <span className="font-semibold">Flare Kit</span>}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="p-2 space-y-1.5">
          {navItems.map((navItem) => (
            <SidebarMenuItem key={navItem.label}>
              <SidebarMenuButton
                tooltip={{
                  children: navItem.label,
                }}
                asChild
              >
                <Link to={navItem.href} className="space-x-0.5">
                  <navItem.icon className="!size-5"/>
                  <span>{navItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
