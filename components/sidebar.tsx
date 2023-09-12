"use client";

import { usePremiumModal } from "@/hooks/use-premium-modal";
import { cn } from "@/lib/utils";
import { Home, Plus, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  isPremium: boolean;
}

export const Sidebar = ({ isPremium }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const proModal = usePremiumModal();

  const routes = [
    {
      icon: Home,
      href: "/",
      label: "Home",
      premium: false,
    },
    {
      icon: Plus,
      href: "/character/new",
      label: "Create",
      premium: true,
    },
    {
      icon: Settings,
      href: "/settings",
      label: "Settings",
      premium: false,
    },
  ];

  const onNavigate = (url: string, premium: boolean) => {
    if (premium && !isPremium) {
      return proModal.onOpen();
    }
    return router.push(url);
  };

  return (
    <div className="space-y-4 flex flex-col h-full tex-primary bg-secondary">
      <div className="p-3 flex flex-1 justify-center">
        <div className="space-y-2">
          {routes.map((route) => (
            <div
              onClick={() => onNavigate(route.href, route.premium)}
              key={route.href}
              className={cn(
                "text-muted-foreground text-xs group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href && "bgg-primary/10 text-primary"
              )}
            >
              <div className="flex flex-col gap-y-2 items-center flex-1">
                <route.icon className="h-5 w-5" />
                {route.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
