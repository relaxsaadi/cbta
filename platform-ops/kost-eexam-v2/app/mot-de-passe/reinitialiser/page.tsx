import { PlaneTakeoff } from "lucide-react";
import { ResetPasswordForm } from "./ResetPasswordForm";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-base px-6 py-12">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-9 text-white">
            <PlaneTakeoff size={16} />
          </div>
          <h1 className="font-display text-[17px] font-semibold tracking-tight text-text-primary">KOST E-EXAM V2</h1>
        </div>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="rounded-lg border border-border-subtle bg-surface-raised p-6 text-center shadow-md">
            <p className="text-[13px] text-status-critical-text">Lien invalide — le jeton est manquant.</p>
          </div>
        )}
      </div>
    </main>
  );
}
