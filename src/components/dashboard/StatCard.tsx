import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: "violet" | "blue" | "emerald" | "orange";
}

const colorMap = {
  violet: {
    bg: "bg-white",
    icon: "bg-violet-100 text-violet-600",
    value: "text-slate-800",
    title: "text-slate-600",
    desc: "text-slate-500",
    border: "border-violet-100",
    shadow: "shadow-sm shadow-violet-100/50 hover:shadow-md hover:shadow-violet-200/50 hover:-translate-y-1",
  },
  blue: {
    bg: "bg-white",
    icon: "bg-blue-100 text-blue-600",
    value: "text-slate-800",
    title: "text-slate-600",
    desc: "text-slate-500",
    border: "border-blue-100",
    shadow: "shadow-sm shadow-blue-100/50 hover:shadow-md hover:shadow-blue-200/50 hover:-translate-y-1",
  },
  emerald: {
    bg: "bg-white",
    icon: "bg-emerald-100 text-emerald-600",
    value: "text-slate-800",
    title: "text-slate-600",
    desc: "text-slate-500",
    border: "border-emerald-100",
    shadow: "shadow-sm shadow-emerald-100/50 hover:shadow-md hover:shadow-emerald-200/50 hover:-translate-y-1",
  },
  orange: {
    bg: "bg-white",
    icon: "bg-orange-100 text-orange-600",
    value: "text-slate-800",
    title: "text-slate-600",
    desc: "text-slate-500",
    border: "border-orange-100",
    shadow: "shadow-sm shadow-orange-100/50 hover:shadow-md hover:shadow-orange-200/50 hover:-translate-y-1",
  },
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border ${c.border} ${c.bg} p-6 transition-all duration-300 ${c.shadow}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.icon}`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
          Total
        </span>
      </div>
      <div>
        <p className={`text-3xl font-extrabold ${c.value}`}>{value}</p>
        <p className={`mt-1 text-sm font-bold ${c.title}`}>{title}</p>
        <p className={`mt-1 text-xs font-medium ${c.desc}`}>{description}</p>
      </div>
    </div>
  );
}
