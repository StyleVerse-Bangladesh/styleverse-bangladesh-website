"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

export function MobileAuthModal() {
  const open = useUiStore((state) => state.isMobileAuthModalOpen);
  const setOpen = useUiStore((state) => state.setMobileAuthModalOpen);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=closed]:animate-out data-[state=open]:animate-in" />
        <Dialog.Content
          id="mobile-auth-modal"
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,430px)] max-h-[calc(100dvh-2rem-env(safe-area-inset-top)-env(safe-area-inset-bottom))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-[#d8d0c4] bg-[#fffdf9] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-zinc-950 shadow-2xl shadow-black/30 outline-none",
            "data-[state=closed]:animate-out data-[state=open]:animate-in",
          )}
          aria-describedby="profile-modal-description"
        >
          <Dialog.Close className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 bg-white text-black shadow-sm transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-black">
            <X className="h-4 w-4" />
            <span className="sr-only">Close profile modal</span>
          </Dialog.Close>

          <div className="pr-10">
            <Dialog.Title className="text-2xl font-semibold tracking-tight">
              Welcome to StyleVerse
            </Dialog.Title>
            <Dialog.Description
              id="profile-modal-description"
              className="mt-2 text-sm leading-6 text-zinc-600"
            >
              Fast checkout • Order tracking • Wishlist sync
            </Dialog.Description>
          </div>

          <div className="mt-6 grid gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 rounded-xl border-zinc-300 bg-white text-sm font-semibold text-zinc-950 shadow-sm hover:bg-zinc-50"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border border-zinc-300 text-xs font-bold"
                aria-hidden="true"
              >
                G
              </span>
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
              <span className="h-px flex-1 bg-zinc-200" />
              or
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <Smartphone className="h-4 w-4" aria-hidden="true" />
                Phone Number
              </div>
              <div className="mt-3 grid gap-3">
                <Input
                  id="profile-phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Phone Number"
                  aria-label="Phone Number"
                  className="h-12 rounded-xl bg-[#fffdf9]"
                />
                <Button
                  type="button"
                  className="h-12 rounded-xl bg-black text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  Send OTP
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
