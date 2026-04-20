"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ReceiptText,
  LogOut,
  Menu,
  User,
  Tags,
} from "lucide-react";

import { logoutAction } from "@/app/actions";
import { APP_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { sheetVariants } from "@/lib/animations";

interface MobileSidebarProps {
  userEmail: string;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard#transactions", label: "Transactions", icon: ReceiptText },
  { href: "/categories", label: "Categories", icon: Tags },
];

export function MobileHeader({ userEmail }: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 lg:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-lg font-bold text-transparent">
            {APP_NAME}
          </span>
        </Link>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <SheetContent
            side="right"
            className="w-70 border-l border-border/60 bg-background/95 backdrop-blur-xl p-0"
          >
            <motion.div
              initial="initial"
              animate="animate"
              exit="exit"
              variants={sheetVariants}
              className="flex h-full flex-col"
            >
              <SheetHeader className="border-b border-border/60 p-4">
                <SheetTitle className="flex items-center justify-between">
                  <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-lg font-bold text-transparent">
                    {APP_NAME}
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* User Info */}
              <div className="border-b border-border/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <User className="size-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm font-medium">{userEmail}</p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-auto p-4">
                <ul className="space-y-1">
                  {navItems.map((item, index) => (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: index * 0.1 },
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          "active:scale-[0.98]",
                        )}
                      >
                        <item.icon className="size-5" />
                        {item.label}
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>

              {/* Footer Actions */}
              <div className="border-t border-border/60 p-4">
                <div className="flex items-center justify-between gap-2">
                  <ThemeToggle />
                  <form action={logoutAction} className="flex-1">
                    <Button
                      variant="outline"
                      type="submit"
                      className="w-full gap-2"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </Button>
                  </form>
                </div>
              </div>
            </motion.div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

// Desktop Sidebar
export function DesktopSidebar({ userEmail }: MobileSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-65 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:border-r lg:border-border/60 lg:bg-card/50 lg:backdrop-blur-xl">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/60 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-xl font-bold text-transparent">
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="border-b border-border/60 p-4 px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto p-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                    "hover:bg-accent hover:text-accent-foreground hover:translate-x-1",
                    "active:scale-[0.98]",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="border-t border-border/60 p-4 px-6">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={logoutAction} className="flex-1">
              <Button variant="outline" type="submit" className="w-full gap-2">
                <LogOut className="size-4" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
