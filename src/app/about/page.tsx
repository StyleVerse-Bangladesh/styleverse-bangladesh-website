import { NewsletterForm } from "@/components/forms/newsletter-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function AboutPage() {
  return (
    <RouteShell title="About" description="Brand content route skeleton.">
      <NewsletterForm />
    </RouteShell>
  );
}
