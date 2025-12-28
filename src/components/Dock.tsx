"use client";

import React from "react";

export type DockItemData = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isActive?: boolean;
};

export type DockProps = {
  items: DockItemData[];
  className?: string;
};

export default function Dock({ items, className = "" }: DockProps) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-30 ${className}`}
    >
      <div className="flex items-center gap-2 bg-white rounded-xl shadow-xl border border-gray-200 px-2 py-2">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex items-center hover:cursor-pointer gap-2 px-4 py-2.5 rounded-xl transition-all ${
              item.isActive
                ? "bg-sky-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
