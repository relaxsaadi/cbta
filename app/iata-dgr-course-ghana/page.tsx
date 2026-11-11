import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_EN, exactMatchMetadata } from "@/lib/exact-match";

const title = "IATA DGR course Ghana | CBTA training";
const description =
  "IATA DGR course Ghana: CBTA functions 7.1 to 7.10, virtual classes from Algiers. Request a written proposal. Check GCAA and operator rules first.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "iata-dgr-course-ghana",
  locale: "en",
  keywords: ["IATA DGR course Ghana", "dangerous goods training Ghana", "CBTA Ghana", "GCAA dangerous goods"],
  languages: { en: "/iata-dgr-course-ghana" },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="en"
      slug="iata-dgr-course-ghana"
      eyebrow="Ghana · no local KOST centre"
      h1="IATA DGR course Ghana"
      description={description}
      lead={[
        `IATA DGR course Ghana: KOST Academy, a ${OFFICIAL_EN}, supports Ghanaian organisations through virtual classes from Algiers, after checking applicable GCAA and operator requirements.`,
        "No KOST training centre is claimed in Ghana. Classes run from 176 Cité Boushaki, Bab Ezzouar. In-person training outside Algeria is considered only after prior written IATA authorization. No fee is shown. This page does not claim that the GCAA has accepted the course.",
      ]}
      sections={[
        {
          id: "who",
          title: "Who needs an IATA DGR course in Ghana",
          paragraphs: [
            "The request usually comes from airlines, ground handlers, freight forwarders and shippers moving dangerous goods by air through Accra, notably Kotoka, or from teams in Tema and other logistics sites whose consignments then fly. Oil and gas support, chemicals, batteries and pharmacy shipments are frequent reasons to ask. They are context. They do not assign a CBTA function.",
            "A forwarder preparing an export declaration and an acceptance agent checking that same shipment do not share a function just because both work in Ghana. Write the duties: classify, pack, mark, document, accept, store, load, screen, or brief a crew. The Nigeria and Kenya pages use the same task rule for their own authorities. This page stays on Ghana.",
          ],
        },
        {
          id: "functions",
          title: "CBTA functions 7.1 to 7.10 scoped from actual duties",
          paragraphs: [
            "The functions cover preparation of consignments, general cargo, acceptance of dangerous goods, handling and loading, passengers and baggage, load planning, flight crew, flight operations and dispatch, cabin crew, and security screening. KOST is approved by ANAC for functions 7.1 to 7.10, reference ANAC/DSOA/SAL-DGR/01/2026, and is listed by IATA as a CBTA centre. That status does not pick the function for a named role in Accra.",
            "Each function has its own page. Function 7.1 is not a template for the others. An old category number in a contract is not mapped automatically. Current IATA DGR, ICAO Annex 18 and Doc 9284 are the usual international sources, read in the edition that applies, together with the operator manual.",
          ],
        },
        {
          id: "delivery",
          title: "Delivery from Algiers (virtual); no KOST centre is claimed in Ghana",
          paragraphs: [
            "Ghanaian participants join a virtual class from the Algiers centre. There is no KOST address in Accra, Tema or elsewhere in Ghana. People who want a classroom can travel to Bab Ezzouar. KOST also has a presence in Paris; this page does not place the course there.",
            "In-person training in Ghana is not a standard offer. It can be studied only after prior written IATA authorization and a check of GCAA and operator requirements. Until those writings exist, plan on the virtual class from Algiers or on attendance in Bab Ezzouar.",
          ],
        },
        {
          id: "local",
          title: "Local GCAA and operator requirements to verify",
          paragraphs: [
            "The Ghana Civil Aviation Authority (GCAA) and the operator's manuals are the local layer to read before enrolment. This page does not quote a GCAA article and does not claim automatic recognition. If you already rely on a written requirement, attach the reference to the request.",
            "The ANAC approval is an Algerian approval for functions 7.1 to 7.10. It is not presented as a GCAA decision. The written proposal will say what can be confirmed and what remains to be checked locally.",
          ],
        },
        {
          id: "recurrent",
          title: "Recurrent training and the 24-month interval",
          paragraphs: [
            "The IATA DGR provides for recurrent training at intervals not exceeding 24 months. Confirm that interval in the current edition and against GCAA or operator rules. This page does not publish an expiry date. Someone trained years ago under another title is scoped again from current duties.",
            "The English recurrent page explains the interval. The French recyclage page is the language pair of that explanation. Functions 7.1 and 7.3 have their own recurrent notes when the function is already known.",
          ],
        },
        {
          id: "proposal",
          title: "How to request a written proposal",
          paragraphs: [
            "Send the duties, the Ghanaian cities, any GCAA or operator reference you already use, and whether a previous course exists. Use the form, email cbta@kostacademy.com, or WhatsApp +213 542 305 383. The reply is written. A phone appointment is not offered.",
            "The proposal names the functions under review and the virtual delivery from Algiers. It will not state that the GCAA has approved the session.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Is there a KOST centre in Ghana?",
          a: "No. Training is by virtual class from Algiers, or in person at Bab Ezzouar if participants travel there. In-person training in Ghana needs prior written IATA authorization.",
        },
        {
          q: "Does the GCAA automatically recognise this course?",
          a: "No. Check GCAA and operator requirements before enrolment. The proposal will not invent that acceptance.",
        },
        {
          q: "Does an oil and gas job title select the function?",
          a: "No. The sector is context. Functions 7.1 to 7.10 follow the tasks actually performed.",
        },
        {
          q: "How do we ask for a proposal?",
          a: "In writing: the form, cbta@kostacademy.com, or WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/iata-dgr-course-nigeria", label: "IATA DGR course Nigeria" },
        { href: "/iata-dgr-course-kenya", label: "IATA DGR course Kenya" },
        { href: "/iata-dgr-recurrent-training", label: "Recurrent training" },
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique (FR)" },
        { href: "/entreprises", label: "Companies" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Home", path: "" },
        { name: "IATA DGR course Ghana", path: "/iata-dgr-course-ghana" },
      ]}
      ctaTitle="Request a written proposal for Ghana"
      ctaText="Describe the duties in Ghana and any GCAA or operator document you already have."
      whatsappMessage="Hello, I would like a written proposal for an IATA DGR course for a team in Ghana."
    />
  );
}
