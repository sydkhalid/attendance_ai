"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Settings, Camera } from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Students", href: "/dashboard/students", icon: Users },
  { name: "Attendance", href: "/dashboard/attendance", icon: Camera },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="h-screen w-64 bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl font-bold mb-6">Attendance AI</h1>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 p-3 rounded-md transition 
              ${active ? "bg-gray-700" : "hover:bg-gray-800"}`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
