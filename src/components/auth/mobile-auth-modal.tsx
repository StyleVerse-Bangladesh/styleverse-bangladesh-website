"use client";

import { useEffect, useState, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import {
  loginSchema,
  registerSchema,
  type LoginValues,
  type RegisterValues,
} from "@/components/forms/schemas";

type AuthMode = "login" | "register";

export function MobileAuthModal() {
  const open = useUiStore((state) => state.isMobileAuthModalOpen);
  const setOpen = useUiStore((state) => state.setMobileAuthModalOpen);
  const [mode, setMode] = useState<AuthMode>("login");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    function closeModalOnTablet(event: MediaQueryListEvent) {
      if (event.matches) {
        setOpen(false);
      }
    }

    if (mediaQuery.matches) {
      setOpen(false);
    }

    mediaQuery.addEventListener("change", closeModalOnTablet);

    return () => mediaQuery.removeEventListener("change", closeModalOnTablet);
  }, [setOpen]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/65 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in md:hidden" />
        <Dialog.Content
          id="mobile-auth-modal"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-zinc-200 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] text-black shadow-2xl shadow-black/30 outline-none",
            "data-[state=closed]:animate-out data-[state=open]:animate-in md:hidden",
          )}
          aria-describedby="mobile-auth-description"
        >
          <Dialog.Close className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200 bg-white text-black shadow-sm transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-black">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Dialog.Title className="pr-12 text-lg font-extrabold tracking-[0.12em]">
            Account
          </Dialog.Title>
          <Dialog.Description
            id="mobile-auth-description"
            className="mt-1 pr-12 text-sm text-zinc-500"
          >
            Login or create an account to continue.
          </Dialog.Description>

          <div className="mt-5 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-700">
              Login with OTP Code
            </h2>
            <div className="mt-3 grid gap-3">
              <Input
                type="tel"
                inputMode="tel"
                placeholder="01xxx-xxxxx"
                aria-label="Phone number for OTP"
                className="h-11 bg-white text-center"
              />
              <Button
                type="button"
                className="mx-auto h-11 min-w-32 rounded-md bg-black text-white hover:bg-zinc-800"
              >
                Send Code
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-md border border-zinc-200 bg-zinc-100 p-1">
            <AuthTabButton
              active={mode === "login"}
              onClick={() => setMode("login")}
            >
              Login
            </AuthTabButton>
            <AuthTabButton
              active={mode === "register"}
              onClick={() => setMode("register")}
            >
              Register
            </AuthTabButton>
          </div>

          <div className="mt-4">
            {mode === "login" ? <MobileLoginForm /> : <MobileRegisterForm />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AuthTabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 items-center justify-center rounded-sm text-xs font-bold uppercase tracking-wide text-zinc-600 transition-colors focus:outline-none focus:ring-2 focus:ring-black",
        active && "bg-white text-black shadow-sm",
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MobileLoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit(() => undefined)}
      noValidate
    >
      <CompactField
        id="mobile-auth-login-email"
        label="Email"
        error={errors.email?.message}
      >
        <Input
          id="mobile-auth-login-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? "mobile-auth-login-email-error" : undefined
          }
          className="h-11"
          {...form.register("email")}
        />
      </CompactField>

      <CompactField
        id="mobile-auth-login-password"
        label="Password"
        error={errors.password?.message}
      >
        <Input
          id="mobile-auth-login-password"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "mobile-auth-login-password-error" : undefined
          }
          className="h-11"
          {...form.register("password")}
        />
      </CompactField>

      <Button type="submit" className="mt-1 h-11 bg-black text-white hover:bg-zinc-800">
        Login
      </Button>
    </form>
  );
}

function MobileRegisterForm() {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit(() => undefined)}
      noValidate
    >
      <CompactField
        id="mobile-auth-register-name"
        label="Full name"
        error={errors.name?.message}
      >
        <Input
          id="mobile-auth-register-name"
          placeholder="Full name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={
            errors.name ? "mobile-auth-register-name-error" : undefined
          }
          className="h-11"
          {...form.register("name")}
        />
      </CompactField>

      <CompactField
        id="mobile-auth-register-email"
        label="Email"
        error={errors.email?.message}
      >
        <Input
          id="mobile-auth-register-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={
            errors.email ? "mobile-auth-register-email-error" : undefined
          }
          className="h-11"
          {...form.register("email")}
        />
      </CompactField>

      <CompactField
        id="mobile-auth-register-password"
        label="Password"
        error={errors.password?.message}
      >
        <Input
          id="mobile-auth-register-password"
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "mobile-auth-register-password-error" : undefined
          }
          className="h-11"
          {...form.register("password")}
        />
      </CompactField>

      <Button type="submit" className="mt-1 h-11 bg-black text-white hover:bg-zinc-800">
        Create account
      </Button>
    </form>
  );
}

function CompactField({
  children,
  error,
  id,
  label,
}: {
  children: ReactNode;
  error?: string;
  id: string;
  label: string;
}) {
  return (
    <div className="grid gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
