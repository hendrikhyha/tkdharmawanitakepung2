import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BookOpen, Star } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/services/auth";

export const metadata: Metadata = {
  title: "Masuk | Jurnal TK Dharma Wanita Kepung 2",
  description:
    "Masuk ke Jurnal TK Dharma Wanita Kepung 2 untuk memantau kegiatan belajar anak Anda.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    switch (user.role) {
      case "ADMIN":
        redirect("/admin");
      case "TEACHER":
        redirect("/teacher");
      case "PARENT":
        redirect("/parent");
    }
  }

  return (
    <main className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 px-4 py-10">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-yellow-400/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 left-0 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl"
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo / Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 p-2 shadow-lg shadow-yellow-400/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dharma-wanita.png"
              alt="Logo Dharma Wanita"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Jurnal TK</h1>
            <p className="mt-0.5 text-xs text-white/70 font-medium">
              Dharma Wanita Kepung 2
            </p>
          </div>
          {/* Stars decoration */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={10}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">Selamat Datang!</h2>
          <p className="mt-1 text-sm text-white/60">
            Masuk untuk melanjutkan ke Jurnal TK
          </p>
        </div>

        <LoginForm />
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TK Dharma Wanita Kepung 2. Hak cipta
        dilindungi.
      </p>
    </main>
  );
}
