"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginValues } from "./schemas";

export function LoginForm() {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      className="grid max-w-md gap-4"
      onSubmit={form.handleSubmit(() => undefined)}
      noValidate
    >
      <div className="grid gap-1">
        <label className="sr-only" htmlFor="login-email">
          Email
        </label>
        <Input
          id="login-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...form.register("email")}
        />
        {errors.email ? (
          <p id="login-email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1">
        <label className="sr-only" htmlFor="login-password">
          Password
        </label>
        <Input
          id="login-password"
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...form.register("password")}
        />
        {errors.password ? (
          <p id="login-password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <Button type="submit">Login</Button>
    </form>
  );
}
