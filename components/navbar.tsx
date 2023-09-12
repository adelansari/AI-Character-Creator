"use client";

import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import { Menu, Sparkles } from "lucide-react";
import { Lato } from "next/font/google";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { usePremiumModal } from "@/hooks/use-premium-modal";

const font = Lato({
  weight: "400",
  subsets: ["latin"],
});

interface NavbarProps {
  isPremium: boolean;
}

export const Navbar = ({ isPremium }: NavbarProps) => {
  const proModal = usePremiumModal();
  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-secondary h-16">
      <div className="flex items-center">
        <MobileSidebar />
        <Link href="/">
          <h1
            className={cn(
              "hidden md:block text-xl md:text-3xl font-bold text-primary",
              font.className
            )}
          >
            CharacterChat
          </h1>
        </Link>
      </div>
      <UserButton afterSignOutUrl="/" />
      <div className="flex items-center gap-x-3">
        {!isPremium && (
          <Button variant="premium" size="sm" onClick={proModal.onOpen}>
            Premium
            <Sparkles className="h-4 w-4 fill-white text-white ml-2" />
          </Button>
        )}
        <ModeToggle />
      </div>
    </div>
  );
};
