"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import {
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Save,
  Search,
  Settings,
  Store,
  Truck,
  Wallet,
  XCircle,
} from "lucide-react";
import {
  updateContactInfoAction,
  updateDeliveryRuleAction,
  updatePaymentMethodAction,
  updatePwaSettingsAction,
  updateSocialLinksAction,
  updateStoreIdentityAction,
  type SettingsActionState,
} from "@/app/admin/(panel)/settings/actions";
import { cn } from "@/lib/utils";

export type SettingsMediaOption = {
  filename: string;
  id: string;
  previewUrl: string | null;
  url: string;
};

export type StoreSettingsFormData = {
  address: string;
  description: string;
  email: string;
  footerLogo: string;
  headerLogo: string;
  phone: string;
  pwaSettings: {
    appName: string;
    backgroundColor: string;
    shortName: string;
    themeColor: string;
  };
  shortName: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    tiktok: string;
    whatsapp: string;
    youtube: string;
  };
  storeName: string;
};

export type PaymentMethodFormData = {
  code: string;
  id: string;
  isActive: boolean;
  isComingSoon: boolean;
  label: string;
  sortOrder: number;
};

export type DeliveryRuleFormData = {
  city: string;
  defaultFee: string;
  deliveryMethod: string;
  freeShippingMinimum: string;
  id: string;
  isActive: boolean;
  sortOrder: number;
};

type SettingsAdminPageProps = {
  deliveryRules: DeliveryRuleFormData[];
  media: SettingsMediaOption[];
  paymentMethods: PaymentMethodFormData[];
  settings: StoreSettingsFormData;
};

const initialActionState: SettingsActionState = {};

export function SettingsAdminPage({
  deliveryRules,
  media,
  paymentMethods,
  settings,
}: SettingsAdminPageProps) {
  const activePayments = paymentMethods.filter((method) => method.isActive).length;
  const activeDeliveryRules = deliveryRules.filter((rule) => rule.isActive).length;

  return (
    <div className="grid gap-6">
      <header className="grid gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-sky-700">Settings</p>
          <h1 className="text-2xl font-black text-zinc-950 sm:text-3xl">
            Store Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">
            Manage global storefront identity, contact details, app metadata,
            payment method labels, and delivery rules.
          </p>
          <Link
            className={cn(secondaryButtonClassName, "mt-4 w-fit")}
            href="/admin/settings/payments"
          >
            <Wallet className="h-4 w-4" aria-hidden="true" />
            Payment Gateway Settings
          </Link>
          <Link
            className={cn(secondaryButtonClassName, "ml-0 mt-2 w-fit sm:ml-2 sm:mt-4")}
            href="/admin/settings/courier"
          >
            <Truck className="h-4 w-4" aria-hidden="true" />
            Courier Settings
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatTile label="Storefront" value={settings.storeName || "Unset"} />
          <StatTile
            label="Payment Methods"
            value={`${activePayments}/${paymentMethods.length} active`}
          />
          <StatTile
            label="Delivery Rules"
            value={`${activeDeliveryRules}/${deliveryRules.length} active`}
          />
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StoreIdentityCard media={media} settings={settings} />
        <ContactInfoCard settings={settings} />
        <SocialLinksCard settings={settings} />
        <PwaSettingsCard settings={settings} />
      </div>

      <PaymentMethodsCard paymentMethods={paymentMethods} />
      <DeliveryRulesCard deliveryRules={deliveryRules} />
    </div>
  );
}

function StoreIdentityCard({
  media,
  settings,
}: {
  media: SettingsMediaOption[];
  settings: StoreSettingsFormData;
}) {
  const [state, formAction] = useActionState(
    updateStoreIdentityAction,
    initialActionState,
  );

  return (
    <SettingsCard
      description="Store naming and logo URLs used by global storefront metadata."
      icon={Store}
      title="Store Identity"
    >
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Store Name">
            <input
              className={inputClassName}
              defaultValue={(state.values?.storeName as string | undefined) ?? settings.storeName}
              name="storeName"
              required
              type="text"
            />
          </FormField>
          <FormField label="Short Name">
            <input
              className={inputClassName}
              defaultValue={(state.values?.shortName as string | undefined) ?? settings.shortName}
              name="shortName"
              type="text"
            />
          </FormField>
        </div>

        <FormField label="Description">
          <textarea
            className={textareaClassName}
            defaultValue={(state.values?.description as string | undefined) ?? settings.description}
            name="description"
            rows={4}
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <LogoPickerField
            defaultValue={(state.values?.headerLogo as string | undefined) ?? settings.headerLogo}
            fieldName="headerLogo"
            label="Header Logo URL"
            media={media}
          />
          <LogoPickerField
            defaultValue={(state.values?.footerLogo as string | undefined) ?? settings.footerLogo}
            fieldName="footerLogo"
            label="Footer Logo URL"
            media={media}
          />
        </div>

        <ActionMessage state={state} />
        <SubmitButton label="Save identity" />
      </form>
    </SettingsCard>
  );
}

function ContactInfoCard({ settings }: { settings: StoreSettingsFormData }) {
  const [state, formAction] = useActionState(
    updateContactInfoAction,
    initialActionState,
  );

  return (
    <SettingsCard
      description="Public support contact details stored with storefront settings."
      icon={Settings}
      title="Contact Info"
    >
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Phone">
            <input
              className={inputClassName}
              defaultValue={(state.values?.phone as string | undefined) ?? settings.phone}
              name="phone"
              type="tel"
            />
          </FormField>
          <FormField label="Email">
            <input
              className={inputClassName}
              defaultValue={(state.values?.email as string | undefined) ?? settings.email}
              name="email"
              type="email"
            />
          </FormField>
        </div>
        <FormField label="Address">
          <textarea
            className={textareaClassName}
            defaultValue={(state.values?.address as string | undefined) ?? settings.address}
            name="address"
            rows={4}
          />
        </FormField>
        <ActionMessage state={state} />
        <SubmitButton label="Save contact" />
      </form>
    </SettingsCard>
  );
}

function SocialLinksCard({ settings }: { settings: StoreSettingsFormData }) {
  const [state, formAction] = useActionState(
    updateSocialLinksAction,
    initialActionState,
  );
  const socials = settings.socialLinks;

  return (
    <SettingsCard
      description="Social profile URLs stored in the socialLinks JSON field."
      icon={Settings}
      title="Social Links"
    >
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Facebook">
            <input className={inputClassName} defaultValue={socials.facebook} name="facebook" type="url" />
          </FormField>
          <FormField label="Instagram">
            <input className={inputClassName} defaultValue={socials.instagram} name="instagram" type="url" />
          </FormField>
          <FormField label="TikTok">
            <input className={inputClassName} defaultValue={socials.tiktok} name="tiktok" type="url" />
          </FormField>
          <FormField label="YouTube">
            <input className={inputClassName} defaultValue={socials.youtube} name="youtube" type="url" />
          </FormField>
        </div>
        <FormField label="WhatsApp">
          <input
            className={inputClassName}
            defaultValue={socials.whatsapp}
            name="whatsapp"
            type="text"
          />
        </FormField>
        <ActionMessage state={state} />
        <SubmitButton label="Save social links" />
      </form>
    </SettingsCard>
  );
}

function PwaSettingsCard({ settings }: { settings: StoreSettingsFormData }) {
  const [state, formAction] = useActionState(
    updatePwaSettingsAction,
    initialActionState,
  );
  const pwa = settings.pwaSettings;

  return (
    <SettingsCard
      description="App metadata saved to pwaSettings JSON without changing PWA files."
      icon={Settings}
      title="PWA/App Metadata"
    >
      <form action={formAction} className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="App Name">
            <input className={inputClassName} defaultValue={pwa.appName} name="appName" type="text" />
          </FormField>
          <FormField label="Short Name">
            <input
              className={inputClassName}
              defaultValue={pwa.shortName}
              name="pwaShortName"
              type="text"
            />
          </FormField>
          <FormField label="Theme Color">
            <ColorInput defaultValue={pwa.themeColor || "#111827"} name="themeColor" />
          </FormField>
          <FormField label="Background Color">
            <ColorInput
              defaultValue={pwa.backgroundColor || "#ffffff"}
              name="backgroundColor"
            />
          </FormField>
        </div>
        <ActionMessage state={state} />
        <SubmitButton label="Save app metadata" />
      </form>
    </SettingsCard>
  );
}

function PaymentMethodsCard({
  paymentMethods,
}: {
  paymentMethods: PaymentMethodFormData[];
}) {
  return (
    <SettingsCard
      description="Edit labels, visibility, launch state, and ordering for supported payment options."
      icon={Wallet}
      title="Payment Methods"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {paymentMethods.map((method) => (
          <PaymentMethodForm key={method.code} method={method} />
        ))}
      </div>
    </SettingsCard>
  );
}

function PaymentMethodForm({ method }: { method: PaymentMethodFormData }) {
  const [state, formAction] = useActionState(
    updatePaymentMethodAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <input name="code" type="hidden" value={method.code} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-zinc-950">{formatPaymentCode(method.code)}</p>
          <p className="text-xs font-semibold uppercase text-zinc-400">
            {method.code}
          </p>
        </div>
        <StatusPill active={method.isActive} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField label="Label">
          <input
            className={inputClassName}
            defaultValue={(state.values?.label as string | undefined) ?? method.label}
            name="label"
            required
            type="text"
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={(state.values?.sortOrder as string | undefined) ?? String(method.sortOrder)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <ToggleField
          defaultChecked={(state.values?.isActive as boolean | undefined) ?? method.isActive}
          label="Active"
          name="isActive"
        />
        <ToggleField
          defaultChecked={(state.values?.isComingSoon as boolean | undefined) ?? method.isComingSoon}
          label="Coming soon"
          name="isComingSoon"
        />
      </div>
      <ActionMessage state={state} />
      <SubmitButton label="Save payment method" />
    </form>
  );
}

function DeliveryRulesCard({
  deliveryRules,
}: {
  deliveryRules: DeliveryRuleFormData[];
}) {
  return (
    <SettingsCard
      description="Edit delivery method fees, thresholds, city targeting, active state, and ordering."
      icon={Truck}
      title="Delivery Rules"
    >
      <div className="grid gap-4">
        {deliveryRules.map((rule) => (
          <DeliveryRuleForm key={rule.id} rule={rule} />
        ))}
      </div>
    </SettingsCard>
  );
}

function DeliveryRuleForm({ rule }: { rule: DeliveryRuleFormData }) {
  const [state, formAction] = useActionState(
    updateDeliveryRuleAction,
    initialActionState,
  );

  return (
    <form action={formAction} className="grid gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <input name="id" type="hidden" value={rule.id} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-black text-zinc-950">{rule.deliveryMethod}</p>
          <p className="text-sm font-semibold text-zinc-500">
            {rule.city || "All cities"}
          </p>
        </div>
        <StatusPill active={rule.isActive} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label="Delivery Method">
          <input
            className={inputClassName}
            defaultValue={(state.values?.deliveryMethod as string | undefined) ?? rule.deliveryMethod}
            name="deliveryMethod"
            required
            type="text"
          />
        </FormField>
        <FormField label="Default Fee">
          <input
            className={inputClassName}
            defaultValue={(state.values?.defaultFee as string | undefined) ?? rule.defaultFee}
            min="0"
            name="defaultFee"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField label="Free Shipping Minimum">
          <input
            className={inputClassName}
            defaultValue={(state.values?.freeShippingMinimum as string | undefined) ?? rule.freeShippingMinimum}
            min="0"
            name="freeShippingMinimum"
            step="0.01"
            type="number"
          />
        </FormField>
        <FormField label="Sort Order">
          <input
            className={inputClassName}
            defaultValue={(state.values?.sortOrder as string | undefined) ?? String(rule.sortOrder)}
            name="sortOrder"
            type="number"
          />
        </FormField>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
        <FormField label="City">
          <input
            className={inputClassName}
            defaultValue={(state.values?.city as string | undefined) ?? rule.city}
            name="city"
            placeholder="Leave empty for all cities"
            type="text"
          />
        </FormField>
        <ToggleField
          defaultChecked={(state.values?.isActive as boolean | undefined) ?? rule.isActive}
          label="Active"
          name="isActive"
        />
      </div>
      <ActionMessage state={state} />
      <SubmitButton label="Save delivery rule" />
    </form>
  );
}

function LogoPickerField({
  defaultValue,
  fieldName,
  label,
  media,
}: {
  defaultValue: string;
  fieldName: string;
  label: string;
  media: SettingsMediaOption[];
}) {
  const [value, setValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState(media);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  async function searchMedia() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/admin/media/api?search=${encodeURIComponent(query)}`,
      );
      const payload = (await response.json()) as { files?: SettingsMediaOption[] };

      setFiles(payload.files ?? []);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <FormField label={label}>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <input
            className={inputClassName}
            name={fieldName}
            onChange={(event) => setValue(event.target.value)}
            type="text"
            value={value}
          />
          <button
            className={secondaryIconButtonClassName}
            onClick={() => setIsOpen(true)}
            title="Choose media"
            type="button"
          >
            <ImageIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        {value ? (
          <div className="relative h-20 w-44 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100">
            <Image alt="" className="object-contain p-2" fill src={value} unoptimized />
          </div>
        ) : null}
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
          <div className="grid max-h-[80vh] w-full max-w-3xl gap-4 overflow-hidden rounded-lg bg-white p-4 shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-zinc-950">Choose Media</h3>
              <button
                className={secondaryButtonClassName}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Close
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className={inputClassName}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search filename"
                type="search"
                value={query}
              />
              <button
                className={primaryButtonClassName}
                disabled={isLoading}
                onClick={searchMedia}
                type="button"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Search className="h-4 w-4" aria-hidden="true" />
                )}
                Search
              </button>
            </div>
            <div className="grid max-h-[52vh] gap-3 overflow-auto sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => (
                <button
                  className="grid gap-2 rounded-md border border-zinc-200 bg-white p-2 text-left text-sm shadow-sm shadow-black/5 transition hover:border-zinc-400"
                  key={file.id}
                  onClick={() => {
                    setValue(file.url);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <div className="relative aspect-video overflow-hidden rounded bg-zinc-100">
                    {file.previewUrl ? (
                      <Image
                        alt={file.filename}
                        className="object-contain p-2"
                        fill
                        src={file.previewUrl}
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <span className="truncate font-semibold text-zinc-700">
                    {file.filename}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </FormField>
  );
}

function ColorInput({
  defaultValue,
  name,
}: {
  defaultValue: string;
  name: string;
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex gap-2">
      <input
        className="h-11 w-14 shrink-0 rounded-md border border-zinc-200 bg-white p-1"
        onChange={(event) => setValue(event.target.value)}
        type="color"
        value={value}
      />
      <input
        className={inputClassName}
        name={name}
        onChange={(event) => setValue(event.target.value)}
        type="text"
        value={value}
      />
    </div>
  );
}

function ToggleField({
  defaultChecked,
  label,
  name,
}: {
  defaultChecked: boolean;
  label: string;
  name: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-800">
      <input
        className="h-4 w-4 accent-zinc-950"
        defaultChecked={defaultChecked}
        name={name}
        type="checkbox"
      />
      {label}
    </label>
  );
}

function SettingsCard({
  children,
  description,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  description: string;
  icon: typeof Settings;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white shadow-sm shadow-black/5">
      <div className="flex items-start gap-3 border-b border-zinc-200 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-black text-zinc-950">{title}</h2>
          <p className="text-sm leading-6 text-zinc-500">{description}</p>
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-black/5">
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 truncate text-xl font-black text-zinc-950">{value}</p>
    </div>
  );
}

function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className={primaryButtonClassName} disabled={pending} type="submit">
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Save className="h-4 w-4" aria-hidden="true" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

function ActionMessage({ state }: { state: SettingsActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-md border px-3 py-2 text-sm font-semibold",
        state.status === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700",
      )}
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </p>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-xs font-semibold",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-zinc-200 bg-zinc-50 text-zinc-500",
      )}
    >
      {active ? (
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatPaymentCode(code: string) {
  return code
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

const inputClassName =
  "min-h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const textareaClassName =
  "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-950 shadow-sm shadow-black/5 transition focus:border-zinc-950 focus:outline-none focus:ring-2 focus:ring-zinc-950/10";

const primaryButtonClassName =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm shadow-black/10 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-fit";

const secondaryButtonClassName =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";

const secondaryIconButtonClassName =
  "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700 shadow-sm shadow-black/5 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-950";
