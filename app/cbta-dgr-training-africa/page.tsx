import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_EN, exactMatchMetadata } from "@/lib/exact-match";

const title = "CBTA DGR training Africa | KOST Academy";
const description =
  "CBTA DGR training Africa for functions 7.1 to 7.10. Centre listed by IATA, approved by ANAC. Virtual classes from Algiers. Written proposal.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "cbta-dgr-training-africa",
  locale: "en",
  keywords: ["CBTA DGR training Africa", "IATA DGR training Africa", "dangerous goods training Africa", "CBTA 7.1 to 7.10"],
  languages: {
    en: "/cbta-dgr-training-africa",
    fr: "/formation-dgr-afrique",
  },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="en"
      slug="cbta-dgr-training-africa"
      eyebrow="English · virtual classes from Algiers"
      h1="CBTA DGR training Africa"
      description={description}
      lead={[
        `CBTA DGR training Africa: KOST Academy, a ${OFFICIAL_EN}, supports organisations across Africa through virtual classes from its Algiers centre.`,
        "There is no KOST training centre to claim outside Algeria on this page. In-person training outside Algeria is considered only after prior written IATA authorization and a check of the local authority's requirements. No fee is published here. The French hub is the Africa page.",
      ]}
      sections={[
        {
          id: "who",
          title: "Who this CBTA DGR training Africa page is for",
          paragraphs: [
            "This page is for airlines, ground handlers, freight forwarders, shippers, oil and gas operators and pharmacy or biomedical teams that move dangerous goods by air and need a CBTA scope for people based in Africa. The work might be preparing a consignment, accepting one, handling it in a warehouse, loading it, screening it, or briefing a crew. The country of the office does not select the function.",
            "French-speaking teams can also start from the French Africa page, or from an existing country page where one is published (Algeria, Morocco, Senegal, Côte d'Ivoire, Cameroon, Tunisia). This English page is the hub for the same training model described for an Africa-wide search. It does not invent a local classroom in each country named in a contract.",
          ],
        },
        {
          id: "functions",
          title: "How CBTA functions 7.1 to 7.10 are scoped from actual duties",
          paragraphs: [
            "Functions 7.1 to 7.10 follow tasks: preparing dangerous goods consignments, processing general cargo, accepting dangerous goods, handling and loading, passengers and baggage, load planning, flight crew, flight operations and dispatch, cabin crew, and security screening. A job title, a sector or an old IATA category number does not assign a function on its own. Two people in the same department can need different functions.",
            "A written proposal starts from a short duty list: what the person receives, what they check, what they may refuse, which documents they sign, and who they hand the shipment to. The individual function pages (7.1 through 7.10) are the reference sheets. Function 7.1 is not a template copied onto the others. Current IATA DGR, ICAO Annex 18 and Doc 9284 remain the usual international sources, read in the edition that applies, together with any operator manual.",
          ],
        },
        {
          id: "delivery",
          title: "Delivery model: virtual classes from Algiers",
          paragraphs: [
            "Virtual classes are delivered from the Algiers centre at 176 Cité Boushaki, Bab Ezzouar. That is the CBTA classroom this page can describe. KOST also has a presence in Paris; this Africa page does not schedule DGR classes there. Teams in Algeria can attend in person at Bab Ezzouar. Teams elsewhere in Africa attend virtually, unless a later written agreement covers something else.",
            "State the number of participants, the countries they work from, the language they need, and whether an operator already requires a named programme. The proposal then confirms scope and delivery. It does not assume that a local civil aviation authority has accepted the course in advance.",
          ],
          subsections: [
            {
              title: "In-person training outside Algeria only after prior written IATA authorization",
              paragraphs: [
                "Physical training outside Algeria is not offered as a standard option. It can be studied only after prior written IATA authorization, and only after the local authority's and the operator's requirements have been checked. Until that written authorization exists, the delivery described on this page is the virtual class from Algiers, or in-person attendance at Bab Ezzouar for people who travel there.",
              ],
            },
          ],
        },
        {
          id: "recurrent",
          title: "Recurrency and the 24-month interval",
          paragraphs: [
            "The IATA DGR provides for recurrent training at intervals not exceeding 24 months. Confirm that interval in the current edition and against the authority or operator rules that apply to the team. This page does not publish an expiry date, and it does not turn the 24-month interval into a calendar date.",
            "Recurrent training still follows current duties. Someone trained years ago under an old category is not renewed under that old number. The French page on the 24-month interval explains the same point for French-speaking readers. Where the function is already known to be 7.1 or 7.3, those pages have a recurrent section.",
          ],
        },
        {
          id: "countries",
          title: "Country starting points",
          paragraphs: [
            "English readers can continue on the Nigeria, Ghana and Kenya pages. Each one states the same limits: no KOST centre in that country, virtual classes from Algiers, and a check of the local authority and the operator before enrolment. The French pages for Tunisia, Mali and Gabon describe the same delivery for French-speaking teams.",
            "The French Africa page links to the country pages that exist: Algeria, Morocco, Senegal, Côte d'Ivoire, Cameroon and Tunisia. Use those pages when the working language is French. Do not read a country name on a menu as proof of a local training centre. Algeria (Bab Ezzouar) is the centre. Paris is a KOST location, not an Africa classroom.",
          ],
        },
        {
          id: "proposal",
          title: "How to request a written proposal",
          paragraphs: [
            "Send the duty list, the countries involved, the function you think may apply, and whether people have been trained before. Use the form on this page, email cbta@kostacademy.com, or WhatsApp +213 542 305 383. The reply is written. A phone appointment is not offered.",
            "The proposal names the functions under review and the delivery that can actually be confirmed. It will say what still has to be checked with the local authority or the operator. That open point is part of the answer, not a refusal to train.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Does KOST run a CBTA centre in each African country?",
          a: "No. The CBTA centre described here is in Algiers, at 176 Cité Boushaki, Bab Ezzouar. Other countries are served by virtual classes from that centre, unless prior written IATA authorization allows in-person training abroad.",
        },
        {
          q: "Is this page the French Africa page in English?",
          a: "It is the English hub for the same search. The French page is formation DGR Afrique. Hreflang links the two. Country detail in French stays on the country pages that exist.",
        },
        {
          q: "Will a job title select function 7.1 to 7.10?",
          a: "No. Functions are scoped from actual duties. A sector such as oil and gas or pharmacy is context, not an automatic assignment.",
        },
        {
          q: "How do we receive a proposal?",
          a: "In writing: the form, cbta@kostacademy.com, or WhatsApp +213 542 305 383. No phone call is offered.",
        },
      ]}
      links={[
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique (FR)" },
        { href: "/iata-dangerous-goods-training-algeria", label: "IATA DGR training Algeria" },
        { href: "/iata-dgr-course-nigeria", label: "IATA DGR course Nigeria" },
        { href: "/iata-dgr-course-ghana", label: "IATA DGR course Ghana" },
        { href: "/iata-dgr-course-kenya", label: "IATA DGR course Kenya" },
        { href: "/iata-dgr-recurrent-training", label: "IATA DGR recurrent training" },
        { href: "/formation-dgr-mali", label: "Formation DGR Mali" },
        { href: "/formation-dgr-gabon", label: "Formation DGR Gabon" },
        { href: "/formation-dgr-tunisie", label: "Formation DGR Tunisie" },
        { href: "/entreprises", label: "Companies" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Schedule" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Home", path: "" },
        { name: "CBTA DGR training Africa", path: "/cbta-dgr-training-africa" },
      ]}
      ctaTitle="Request a written proposal"
      ctaText="List the countries, the duties, and whether you need a virtual class from Algiers or in-person attendance in Bab Ezzouar."
      whatsappMessage="Hello, I would like a written proposal for CBTA DGR training Africa."
    />
  );
}
