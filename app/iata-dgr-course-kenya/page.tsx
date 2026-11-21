import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_EN, exactMatchMetadata } from "@/lib/exact-match";

const title = "IATA DGR course Kenya | CBTA training";
const description =
  "IATA DGR course Kenya: CBTA functions 7.1 to 7.10, virtual classes from Algiers. Request a written proposal. Check KCAA and operator rules first.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "iata-dgr-course-kenya",
  locale: "en",
  keywords: ["IATA DGR course Kenya", "dangerous goods training Kenya", "CBTA Kenya", "KCAA dangerous goods"],
  languages: { en: "/iata-dgr-course-kenya" },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="en"
      slug="iata-dgr-course-kenya"
      eyebrow="Kenya · no local KOST centre"
      h1="IATA DGR course Kenya"
      description={description}
      lead={[
        `IATA DGR course Kenya: KOST Academy, a ${OFFICIAL_EN}, supports Kenyan organisations through virtual classes from Algiers, after checking applicable KCAA and operator requirements.`,
        "No KOST training centre is claimed in Kenya. Virtual classes are delivered from 176 Cité Boushaki, Bab Ezzouar. In-person training outside Algeria needs prior written IATA authorization. No fee is published. Automatic acceptance by the KCAA is not claimed.",
      ]}
      sections={[
        {
          id: "who",
          title: "Who needs an IATA DGR course in Kenya",
          paragraphs: [
            "Teams ask from airlines and handlers at Nairobi, including Jomo Kenyatta as the main international cargo gateway, from freight forwarders in Nairobi and Mombasa, and from shippers in horticulture, pharmacy, oil and gas support or general industry when a consignment is prepared for a flight. Mombasa is a sea-port context: this page still covers only the air leg, not a road regime.",
            "East African cargo connects through Nairobi for many operators. That geography does not select function 7.1, 7.3 or any other function. Two desks in the same building can prepare shipments and accept them. Describe each group. The Ghana and Nigeria pages apply the same method to GCAA and NCAA. Here the local authority to check is the KCAA.",
          ],
        },
        {
          id: "functions",
          title: "CBTA functions 7.1 to 7.10 scoped from actual duties",
          paragraphs: [
            "Functions 7.1 to 7.10 follow tasks: preparing consignments, processing general cargo, accepting dangerous goods, handling and loading, passengers and baggage, load planning, flight crew, dispatch, cabin crew, and security screening. KOST is listed by IATA as a CBTA centre and approved by ANAC for these functions, reference ANAC/DSOA/SAL-DGR/01/2026. The reference does not assign a Kenyan employee to a function.",
            "Send what each person receives, checks, may refuse, signs, and hands over. An old category in a manual is evidence of an internal label, not an automatic mapping. IATA DGR, ICAO Annex 18 and Doc 9284 are read in the current edition, plus any operator rule.",
          ],
        },
        {
          id: "delivery",
          title: "Delivery from Algiers (virtual); no KOST centre is claimed in Kenya",
          paragraphs: [
            "Kenyan participants attend virtually from Algiers. There is no KOST classroom in Nairobi or Mombasa. In-person attendance at the centre means travel to Bab Ezzouar. Paris is another KOST location; this course is not scheduled there on this page.",
            "A classroom in Kenya is studied only after prior written IATA authorization and confirmation of KCAA and operator requirements. Until then, the delivery that can be described is the virtual class from Algiers, or the centre in Bab Ezzouar.",
          ],
        },
        {
          id: "local",
          title: "Local KCAA and operator requirements to verify",
          paragraphs: [
            "Before enrolment, check what the Kenya Civil Aviation Authority and the operator require for the role. This page does not quote a KCAA clause and does not say the course is recognised in Kenya by default. Attach any written requirement you already have.",
            "The Algerian approval reference stays ANAC/DSOA/SAL-DGR/01/2026. It is not a KCAA decision. The proposal will separate what is confirmed from what is still open.",
          ],
        },
        {
          id: "recurrent",
          title: "Recurrent training and the 24-month interval",
          paragraphs: [
            "The IATA DGR provides for recurrent training at intervals not exceeding 24 months, to be confirmed in the current edition and against KCAA or operator rules. No expiry date is printed here. Recurrency follows duties held now, not the title used on the previous course.",
            "See the English recurrent page, linked with the French recyclage page. Where the function is already 7.1 or 7.3, those pages have a recurrent section.",
          ],
        },
        {
          id: "proposal",
          title: "How to request a written proposal",
          paragraphs: [
            "Write the duties, the Kenyan cities, the function you think may apply, and any previous training date. Use the form, cbta@kostacademy.com, or WhatsApp +213 542 305 383. The reply is written. The form may lead to a callback to clarify the request.",
            "The proposal will name the functions to examine and the virtual delivery from Algiers. It will not state that the KCAA has approved the session.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Is there a KOST centre in Kenya?",
          a: "No. The course is a virtual class from Algiers, or in person at Bab Ezzouar. In-person training in Kenya requires prior written IATA authorization.",
        },
        {
          q: "Does the KCAA automatically recognise the course?",
          a: "No. Check KCAA and operator rules first. Recognition is not claimed on this page.",
        },
        {
          q: "Does Nairobi cargo automatically mean function 7.3?",
          a: "No. Acceptance is 7.3 only when the tasks are acceptance tasks. Preparation, handling and screening are separate functions.",
        },
        {
          q: "How do we receive a proposal?",
          a: "In writing: the form, cbta@kostacademy.com, or WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/iata-dgr-course-nigeria", label: "IATA DGR course Nigeria" },
        { href: "/iata-dgr-course-ghana", label: "IATA DGR course Ghana" },
        { href: "/iata-dgr-recurrent-training", label: "Recurrent training" },
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique (FR)" },
        { href: "/entreprises", label: "Companies" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Home", path: "" },
        { name: "IATA DGR course Kenya", path: "/iata-dgr-course-kenya" },
      ]}
      ctaTitle="Request a written proposal for Kenya"
      ctaText="Describe the duties in Kenya and any KCAA or operator document you already have."
      whatsappMessage="Hello, I would like a written proposal for an IATA DGR course for a team in Kenya."
    />
  );
}
