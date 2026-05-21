import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="container">Loading…</main>}>
      <LoginForm />
    </Suspense>
  );
}
