import type { Metadata } from "next";
import { KeyRound } from "lucide-react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Lupa Password | Jurnal TK Dharma Wanita Kepung 2",
  description: "Reset password akun Jurnal TK Dharma Wanita Kepung 2 Anda.",
};

export default function ForgotPasswordPage() {
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

      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-400 shadow-lg shadow-yellow-400/40">
            <KeyRound size={32} className="text-yellow-900" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Lupa Password?</h1>
            <p className="mt-1 text-sm text-white/60">
              Masukkan email Anda dan kami akan mengirimkan link untuk mereset
              password.
            </p>
          </div>
        </div>

        <ForgotPasswordForm />
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        © {new Date().getFullYear()} TK Dharma Wanita Kepung 2
      </p>
    </main>
  );
}
