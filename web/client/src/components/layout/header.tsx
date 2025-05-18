"use client";

import { useState } from "react";
import Link from "next/link";
import { BellIcon, MoonIcon, SunIcon, MenuIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

export function Header({ openSidebar }: { openSidebar?: () => void }) {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-14 items-center border-b bg-white px-4 dark:bg-slate-900">
      <button
        onClick={openSidebar}
        className="mr-4 rounded-md p-1.5 text-slate-500 hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="mr-4 flex-1">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <BellIcon className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-error"></span>
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border bg-white p-2 shadow-lg dark:bg-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium">Notificações</span>
                <button className="text-xs text-primary-600 hover:underline dark:text-primary-400">
                  Marcar todas como lidas
                </button>
              </div>
              
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  Sem notificações
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {/* Notificações vão aqui */}
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={toggleTheme}
          className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </header>
  );
}