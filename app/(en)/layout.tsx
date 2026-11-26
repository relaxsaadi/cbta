import "../globals.css";
import { RootShell, baseMetadata, baseViewport } from "@/components/RootShell";

export const metadata = baseMetadata;
export const viewport = baseViewport;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell lang="en">{children}</RootShell>;
}
