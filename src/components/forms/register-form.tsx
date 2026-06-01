"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema, type RegisterValues } from "./schemas";

export function RegisterForm() {
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  return (
    <form
      className="grid max-w-md gap-4"
      onSubmit={form.handleSubmit(() => undefined)}
      noValidate
    >
      <div className="grid gap-1">
        <label className="sr-only" htmlFor="register-name">
          Full name
        </label>
        <Input
          id="register-name"
          placeholder="Full name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          {...form.register("name")}
        />
        {errors.name ? (
          <p id="register-name-error" className="text-sm text-destructive" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1">
        <label className="sr-only" htmlFor="register-email">
          Email
        </label>
        <Input
          id="register-email"
          placeholder="Email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...form.register("email")}
        />
        {errors.email ? (
          <p id="register-email-error" className="text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>
      <div className="grid gap-1">
        <label className="sr-only" htmlFor="register-password">
          Password
        </label>
        <Input
          id="register-password"
          placeholder="Password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "register-password-error" : undefined
          }
          {...form.register("password")}
        />
        {errors.password ? (
          <p id="register-password-error" className="text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>
      <Button type="submit">Create account</Button>
    </form>
  );
}
