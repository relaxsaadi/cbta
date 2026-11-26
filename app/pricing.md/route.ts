import { pricingMd } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(pricingMd(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
