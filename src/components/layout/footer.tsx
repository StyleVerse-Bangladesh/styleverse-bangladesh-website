import type { SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteContainerClassName } from "@/lib/constants/layout";
import { cn } from "@/lib/utils";
import type { StorefrontSettingsDto } from "@/types/api/settings.dto";

const informationLinks = [
  { label: "About StyleVerse", href: "/about" },
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cancellation & Return Policy", href: "/cancellation-and-return-policy" },
  { label: "Contact Us", href: "/contact" },
];

const contactLines = {
  primaryEmail: "support@styleversebangladesh.com",
  secondaryEmail: "info@styleversebangladesh.com",
  phone: "+880 1511937953",
};

const fallbackSocialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/styleverse.bangladesh/",
    icon: InstagramIcon,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@styleversebangladesh",
    icon: TikTokIcon,
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/styleversebangladesh",
    icon: FacebookIcon,
  },
  {
    label: "Pinterest",
    href: "https://www.pinterest.com/styleversebangladesh",
    icon: PinterestIcon,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@styleversebangladesh",
    icon: YouTubeIcon,
  },
];

type FacebookPagePreviewData = {
  name: string;
  followers: string;
  following: string;
  verified: boolean;
  actionLabel: string;
  pageUrl: string;
};

type FooterProps = {
  facebookPreview?: FacebookPagePreviewData;
  settings: StorefrontSettingsDto;
};

// Frontend-static placeholder for now. Later this should be hydrated from a
// backend/admin API, never directly from Facebook in the browser.
const defaultFacebookPagePreview: FacebookPagePreviewData = {
  name: "StyleVerse Bangladesh",
  followers: "0 followers",
  following: "0 following",
  verified: true,
  actionLabel: "Follow",
  pageUrl: "https://www.facebook.com/styleversebangladesh",
};

const footerLinkUnderline =
  "relative inline-block after:pointer-events-none after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-[#C8C8C8] after:transition-transform after:duration-200 after:ease-out group-hover:after:scale-x-100 group-focus-visible:after:scale-x-100";

export function Footer({ facebookPreview, settings }: FooterProps) {
  const contactEmails = settings.contact.email
    ? [settings.contact.email]
    : [contactLines.primaryEmail, contactLines.secondaryEmail];
  const contactPhone = settings.contact.phone || contactLines.phone;
  const footerSocialLinks = getFooterSocialLinks(settings);
  const facebookPagePreview = facebookPreview ?? {
    ...defaultFacebookPagePreview,
    name: settings.storeName,
    pageUrl:
      footerSocialLinks.find((link) => link.label === "Facebook")?.href ??
      defaultFacebookPagePreview.pageUrl,
  };

  return (
    <footer className="relative overflow-hidden bg-black text-white">
      <div className="pointer-events-none absolute inset-0 opacity-[0.09]">
        <div className="absolute left-[8%] top-[-26%] text-[15rem] font-black leading-none text-transparent [-webkit-text-stroke:2px_#3A3A3A] sm:text-[19rem] lg:left-[14%] lg:text-[24rem]">
          SV
        </div>
        <div className="absolute right-[-3%] top-[-16%] text-[12rem] font-black leading-none text-transparent [-webkit-text-stroke:2px_#3A3A3A] sm:text-[17rem] lg:text-[23rem]">
          BD
        </div>
      </div>

      <div
        className={cn(
          siteContainerClassName,
          "relative grid grid-cols-2 gap-x-5 gap-y-6 py-5 sm:gap-x-8 sm:gap-y-7 sm:py-6 md:gap-x-10 lg:grid-cols-[1.2fr_0.9fr_1fr_0.85fr] lg:items-center lg:gap-12 lg:py-8",
        )}
      >
        <div className="min-w-0 lg:self-center">
          <Link
            href="/"
            aria-label={`${settings.storeName} home`}
            className="inline-flex flex-col items-center"
          >
            <Image
              src={settings.logo.footer}
              alt={settings.storeName}
              width={3000}
              height={436}
              className="h-auto w-32 drop-shadow-sm xs:w-40 sm:w-52 lg:w-64"
              priority={false}
              unoptimized={isExternalImage(settings.logo.footer)}
            />
            <span className="mt-1.5 w-32 text-center text-[9px] font-semibold uppercase leading-4 tracking-[0.18em] text-white/70 xs:w-40 sm:w-52 sm:text-[10px] sm:tracking-[0.24em] lg:mt-2 lg:w-64 lg:text-[11px]">
              {settings.storeName}
            </span>
          </Link>

          <p className="mt-4 flex items-start gap-2 text-[11px] font-semibold leading-5 text-white sm:text-xs lg:mt-5 lg:text-sm">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8C8C8] lg:h-4 lg:w-4" />
            Worktime: SAT - FRI, 10AM - 11PM
          </p>
        </div>

        <nav className="min-w-0 lg:-ml-4 lg:self-start" aria-label="Footer information">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#C8C8C8] sm:text-sm lg:text-base">
            Information
          </h2>
          <ul className="mt-3 space-y-1.5 sm:mt-4 sm:space-y-2 lg:mt-5">
            {informationLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group block min-h-7 text-[11px] leading-5 text-white transition-colors hover:text-[#C8C8C8] sm:text-xs lg:min-h-0"
                >
                  <span className={footerLinkUnderline}>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 lg:-ml-4 lg:self-start">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#C8C8C8] sm:text-sm lg:text-base">
            Contact Info
          </h2>
          <div className="mt-3 space-y-3 text-[11px] leading-5 text-white sm:mt-4 sm:text-xs lg:mt-5 lg:space-y-3">
            <div className="space-y-2.5 lg:space-y-3">
              {contactEmails.map((email) => (
                <a
                  href={`mailto:${email}`}
                  className="group flex min-h-7 min-w-0 items-start gap-2 break-words transition-colors hover:text-[#C8C8C8]"
                  key={email}
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8C8C8] lg:h-4 lg:w-4" />
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    <span className={footerLinkUnderline}>{email}</span>
                  </span>
                </a>
              ))}
              {settings.contact.address ? (
                <p className="flex min-h-7 min-w-0 items-start gap-2 break-words">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C8C8C8] lg:h-4 lg:w-4" />
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    {settings.contact.address}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 font-medium lg:gap-x-5">
              <a
                href={`tel:${contactPhone.replace(/\s+/g, "")}`}
                className="group flex min-h-7 items-center gap-2 transition-colors hover:text-[#C8C8C8]"
              >
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#C8C8C8] lg:h-4 lg:w-4" />
                <span className={footerLinkUnderline}>{contactPhone}</span>
              </a>
            </div>
          </div>
        </div>

        <aside className="col-span-2 min-w-0 sm:col-span-1 lg:-ml-4 lg:self-start">
          <h2 className="text-xs font-extrabold uppercase tracking-wide text-[#C8C8C8] sm:text-sm lg:text-base">
            Follow Us
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-3 sm:mt-4 lg:mt-5">
            {footerSocialLinks.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="group flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-110 hover:border-white/70 hover:bg-white hover:text-black hover:shadow-[0_14px_28px_rgba(255,255,255,0.18)] focus-visible:-translate-y-1 focus-visible:scale-110 focus-visible:border-white/70 focus-visible:bg-white focus-visible:text-black focus-visible:shadow-[0_14px_28px_rgba(255,255,255,0.18)] sm:h-8 sm:w-8"
                >
                  <Icon
                    className="h-4 w-4 transition-transform duration-300 ease-out group-hover:rotate-6 group-hover:scale-110 group-focus-visible:rotate-6 group-focus-visible:scale-110"
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </div>

          <div className="mt-3 w-full overflow-hidden rounded-lg border border-[#C8C8C8]/20 bg-white/[0.08] px-2.5 py-2 shadow-[0_16px_36px_rgba(0,0,0,0.3)] backdrop-blur-md sm:px-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#1877F2] shadow-[0_8px_20px_rgba(0,0,0,0.24)]">
                <FacebookPreviewIcon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <p className="text-xs font-extrabold leading-4 text-white">
                    {facebookPagePreview.name}
                  </p>
                  {facebookPagePreview.verified ? (
                    <VerifiedBadgeIcon
                      className="h-3 w-3 shrink-0 text-[#C8C8C8]"
                      aria-hidden="true"
                    />
                  ) : null}
                </div>
                <p className="mt-0.5 whitespace-nowrap text-[10px] leading-4 text-white/70">
                  {facebookPagePreview.followers} &bull;{" "}
                  {facebookPagePreview.following}
                </p>
              </div>
              <a
                href={facebookPagePreview.pageUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${facebookPagePreview.actionLabel} ${facebookPagePreview.name} on Facebook`}
                className="ml-auto inline-flex h-6 shrink-0 items-center justify-center rounded-full border border-white/70 px-2.5 text-[10px] font-bold leading-none text-white transition-colors hover:border-white hover:bg-white hover:text-black"
              >
                {facebookPagePreview.actionLabel}
              </a>
            </div>
          </div>
        </aside>
      </div>

      <p
        className={cn(
          siteContainerClassName,
          "relative pb-4 text-center text-[10px] leading-5 text-white/60 sm:text-[11px]",
        )}
      >
        &copy; {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </p>
    </footer>
  );
}

function getFooterSocialLinks(settings: StorefrontSettingsDto) {
  const dbLinks = settings.socialLinks
    .filter((link) => link.isActive)
    .map((link) => {
      const Icon = getSocialIcon(link.id);

      if (!Icon) {
        return null;
      }

      return {
        href: link.href,
        icon: Icon,
        label: link.label,
      };
    })
    .filter((link): link is (typeof fallbackSocialLinks)[number] =>
      Boolean(link),
    );

  return dbLinks.length ? dbLinks : fallbackSocialLinks;
}

function getSocialIcon(id: string) {
  if (id === "facebook") {
    return FacebookIcon;
  }

  if (id === "instagram") {
    return InstagramIcon;
  }

  if (id === "tiktok") {
    return TikTokIcon;
  }

  if (id === "youtube") {
    return YouTubeIcon;
  }

  return null;
}

function isExternalImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function FacebookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M14.18 8.4V6.72c0-.78.52-.96.88-.96h2.24V2.14L14.22 2.13c-3.42 0-4.2 2.56-4.2 4.2V8.4H7.3v3.72h2.72V22h4.16v-9.88h3.08l.4-3.72h-3.48Z" />
    </svg>
  );
}

function FacebookPreviewIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.67 13.47 17.24 9.8h-3.55V7.41c0-1.01.5-1.99 2.08-1.99h1.61V2.29S15.93 2 14.53 2c-2.93 0-4.85 1.78-4.85 4.99V9.8H6.43v3.67h3.25v8.86a12.97 12.97 0 0 0 4.01 0v-8.86h2.98Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <rect
        width="15.5"
        height="15.5"
        x="4.25"
        y="4.25"
        rx="4.2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.35" cy="7.65" r="1.05" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.64 3.1c.36 2.28 1.63 3.64 3.86 3.78v3.45a6.96 6.96 0 0 1-3.78-1.16v5.77c0 3.72-2.42 6.06-5.76 6.06-3.08 0-5.46-2.08-5.46-5.16 0-3.5 3.18-5.88 6.52-5.18v3.54c-1.62-.52-2.98.23-2.98 1.63 0 1.08.82 1.72 1.92 1.72 1.24 0 2.07-.72 2.07-2.48V3.1h3.61Z" />
    </svg>
  );
}

function PinterestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2.5c-5.03 0-7.57 3.52-7.57 6.46 0 1.82.69 3.44 2.17 4.04.24.1.46 0 .53-.27.05-.18.16-.65.21-.84.07-.27.04-.37-.16-.61-.43-.5-.7-1.15-.7-2.07 0-2.68 2-5.08 5.22-5.08 2.85 0 4.42 1.74 4.42 4.07 0 3.06-1.35 5.64-3.36 5.64-1.11 0-1.94-.92-1.67-2.04.32-1.35.94-2.8.94-3.77 0-.87-.47-1.6-1.43-1.6-1.13 0-2.04 1.17-2.04 2.74 0 1 .34 1.68.34 1.68l-1.37 5.8c-.41 1.72-.06 3.83-.03 4.04.02.13.19.16.27.06.11-.14 1.51-1.87 1.99-3.6.14-.49.78-3.04.78-3.04.39.74 1.52 1.39 2.72 1.39 3.58 0 6.01-3.26 6.01-7.63 0-3.3-2.8-6.37-7.04-6.37Z" />
    </svg>
  );
}

function YouTubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21.55 7.04a3.02 3.02 0 0 0-2.13-2.14C17.54 4.4 12 4.4 12 4.4s-5.54 0-7.42.5a3.02 3.02 0 0 0-2.13 2.14A31.35 31.35 0 0 0 1.95 12c0 1.71.17 3.43.5 4.96a3.02 3.02 0 0 0 2.13 2.14c1.88.5 7.42.5 7.42.5s5.54 0 7.42-.5a3.02 3.02 0 0 0 2.13-2.14c.33-1.53.5-3.25.5-4.96s-.17-3.43-.5-4.96ZM10 15.55v-7.1L16.2 12 10 15.55Z" />
    </svg>
  );
}

function VerifiedBadgeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 1.5 12 3l2.48.02.78 2.35 2 1.48-.75 2.37.75 2.37-2 1.48-.78 2.35L12 15.45 10 17l-2-1.55-2.48-.03-.78-2.35-2-1.48.75-2.37-.75-2.37 2-1.48.78-2.35L8 3l2-1.5Zm3.3 6.4-1.06-1.06-3.1 3.1-1.38-1.38L6.7 9.62l2.44 2.44 4.16-4.16Z" />
    </svg>
  );
}
