import { LoginForm } from "@/components/forms/login-form";
import { RouteShell } from "@/components/shared/route-shell";

export default function LoginPage() {
  return (
    <RouteShell title="Login" description="Authentication route skeleton.">
      <LoginForm />
    </RouteShell>
  );
}
