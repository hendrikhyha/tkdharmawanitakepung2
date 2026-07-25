"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import {
  forgotPasswordSchema,
  ForgotPasswordFormValues,
} from "@/lib/validations/auth";
import { forgotPassword } from "@/app/actions/auth";

export default function ForgotPasswordForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true);
    setServerError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("email", values.email);

    const result = await forgotPassword(formData);

    if ("error" in result) {
      setServerError(result.error ?? "Terjadi kesalahan.");
    } else if ("success" in result) {
      setSuccessMsg(result.success ?? "Berhasil.");
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="forgot-email"
          className="block text-sm font-medium text-white/80"
        >
          Email
        </label>
        <input
          id="forgot-email"
          type="email"
          autoComplete="email"
          placeholder="email@contoh.com"
          {...register("email")}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition focus:border-yellow-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
        />
        {errors.email && (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-green-400/30 bg-green-500/20 px-4 py-3 text-sm text-green-200">
          {successMsg}
        </div>
      )}

      <button
        id="forgot-password-submit-btn"
        type="submit"
        disabled={isLoading || !!successMsg}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-yellow-900 shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Mail size={16} />
            Kirim Link Reset
          </>
        )}
      </button>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-white/60 transition hover:text-white"
      >
        <ArrowLeft size={14} />
        Kembali ke halaman masuk
      </Link>
    </form>
  );
}
