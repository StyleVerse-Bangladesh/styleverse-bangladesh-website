"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { newsletterSchema, type NewsletterValues } from "./schemas";

export function NewsletterForm() {
  const form = useForm<NewsletterValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  return (
    <form className="flex max-w-md gap-2" onSubmit={form.handleSubmit(() => undefined)}>
      <Input placeholder="Email address" type="email" {...form.register("email")} />
      <Button type="submit">Join</Button>
    </form>
  );
}
