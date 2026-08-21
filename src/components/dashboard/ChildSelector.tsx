"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export interface ChildOption {
  id: string;
  name: string;
  className?: string | null;
}

interface ChildSelectorProps {
  children: ChildOption[];
  /** Currently selected child ID from searchParams */
  selectedChildId?: string | null;
}

export default function ChildSelector({ children, selectedChildId }: ChildSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't render if parent has 0 or 1 child
  if (children.length <= 1) return null;

  const handleSelect = (childId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (childId === "all") {
      params.delete("child");
    } else {
      params.set("child", childId);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  const currentId = selectedChildId || "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
        Anak:
      </span>
      <button
        onClick={() => handleSelect("all")}
        className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
          currentId === "all"
            ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-200"
            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        }`}
      >
        Semua
      </button>
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => handleSelect(child.id)}
          className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 ${
            currentId === child.id
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
          }`}
        >
          {child.name}
        </button>
      ))}
    </div>
  );
}
