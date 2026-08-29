import { PlaneTakeoff } from "lucide-react";
import { ForgotPasswordForm } from "./ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-9 text-white">
            <PlaneTakeoff size={16} />
          </div>
          <h1 className="font-display text-[17px] font-semibold tracking-tight text-text-primary">KOST E-EXAM V2</h1>
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
