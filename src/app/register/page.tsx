import { RegisterForm } from "@/components/forms/register-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function RegisterPage() {
  return (
    <RouteShell title="Register" description="Account creation route skeleton.">
      <RegisterForm />
    </RouteShell>
  );
}
