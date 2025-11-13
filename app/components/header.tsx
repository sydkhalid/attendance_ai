"use client";

import { Bell } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h2 className="text-xl font-semibold">Admin Panel</h2>
      <div className="flex items-center gap-4">
        <Bell className="text-gray-600" />
      </div>
    </header>
  );
}
