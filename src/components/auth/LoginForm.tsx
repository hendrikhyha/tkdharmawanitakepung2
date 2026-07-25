"use client";

import { useState } from "react";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginSchema, LoginFormValues } from "@/lib/validations/auth";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setServerError(null);

    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);

    const { login } = await import("@/app/actions/auth");
    const result = await login(formData).catch(() => null);

    if (result && "error" in result) {
      setServerError(result.error);
      setIsLoading(false);
    }
    // If redirect happens, isLoading stays true (page navigates away)
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-sm font-medium text-white/80"
        >
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="guru@tkdharmawanita.sch.id"
          {...register("email")}
          className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition focus:border-yellow-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
        />
        {errors.email && (
          <p className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-password"
          className="block text-sm font-medium text-white/80"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white placeholder:text-white/40 backdrop-blur-sm transition focus:border-yellow-400/60 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-yellow-400/30"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 transition hover:text-white/80"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-300">{errors.password.message}</p>
        )}
      </div>

      {/* Server Error */}
      {serverError && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/20 px-4 py-3 text-sm text-red-200">
          {serverError}
        </div>
      )}

      {/* Forgot password link */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-xs text-white/60 transition hover:text-yellow-400"
        >
          Lupa password?
        </Link>
      </div>

      {/* Submit */}
      <button
        id="login-submit-btn"
        type="submit"
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-yellow-900 shadow-lg shadow-yellow-400/20 transition hover:bg-yellow-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Masuk...
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
