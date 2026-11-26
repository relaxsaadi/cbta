import type { Metadata } from "next";
import DGRPage from "@/components/DGRPage";
import { getFormationBySlug } from "@/lib/formations";
import { buildFormationMetadata, courseSchema } from "@/lib/page-meta";

const formation = getFormationBySlug("dgr-7-2")!;
export const metadata: Metadata = buildFormationMetadata(formation);

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema(formation)) }}
      />
      <DGRPage formation={formation} />
    </>
  );
}
