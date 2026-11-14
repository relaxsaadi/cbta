import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_EN, exactMatchMetadata } from "@/lib/exact-match";

const title = "IATA DGR course Nigeria | CBTA training";
const description =
  "IATA DGR course Nigeria: CBTA functions 7.1 to 7.10, virtual classes from Algiers. Request a written proposal. Check NCAA and operator rules first.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "iata-dgr-course-nigeria",
  locale: "en",
  keywords: ["IATA DGR course Nigeria", "dangerous goods training Nigeria", "CBTA Nigeria", "NCAA dangerous goods training"],
  languages: {
    en: "/iata-dgr-course-nigeria",
  },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="en"
      slug="iata-dgr-course-nigeria"
      eyebrow="Nigeria · no local KOST centre"
      h1="IATA DGR course Nigeria"
      description={description}
      lead={[
        `IATA DGR course Nigeria: KOST Academy, a ${OFFICIAL_EN}, trains Nigerian organisations remotely from Algiers, after checking applicable NCAA and operator requirements.`,
        "No KOST training centre is claimed in Nigeria. Virtual classes run from 176 Cité Boushaki, Bab Ezzouar. In-person training outside Algeria is possible only after prior written IATA authorization. No fee is shown on this page. This course is not presented as automatically accepted by the NCAA.",
      ]}
      sections={[
        {
          id: "who",
          title: "Who typically needs an IATA DGR course in Nigeria",
          paragraphs: [
            "The search usually comes from airlines and their ground handlers, freight forwarders, shippers, oil and gas operators, and pharmacy or biomedical teams that put dangerous goods on an aircraft in or from Nigeria. Cargo acceptance, warehouse handling, shipper declaration, security screening and crew awareness are different jobs. They can share an office in Lagos, Abuja, Port Harcourt or elsewhere and still need different CBTA functions.",
            "Oil and gas traffic, including samples and chemicals that later move by air, is a frequent reason Nigerian teams ask for DGR training. The sector explains the context. It does not assign function 7.1, 7.3 or any other function. Write down the tasks. The same rule applies to a pharmacy shipment or to a freight forwarder's export desk.",
          ],
        },
        {
          id: "functions",
          title: "CBTA functions 7.1 to 7.10 scoped from actual duties, not job titles alone",
          paragraphs: [
            "The ten functions cover preparation of consignments, general cargo, acceptance of dangerous goods, handling and loading, passengers and baggage, load planning, flight crew, flight operations officers and dispatchers, cabin crew, and security screening. KOST is approved by ANAC for functions 7.1 to 7.10, reference ANAC/DSOA/SAL-DGR/01/2026, and is listed by IATA as a CBTA centre. That status does not pick the function for a named employee in Nigeria.",
            "Send, for each group, what they touch: classification, packing, marking, documentation, acceptance checks, storage, loading, NOTOC-type information to the crew, or screening. If an operator manual already names a role, attach the reference. The manual is evidence of an internal requirement. It is not a substitute for the current IATA DGR, ICAO Annex 18 and Doc 9284, which still have to be read in the applicable edition.",
          ],
        },
        {
          id: "delivery",
          title: "Delivery: virtual classes from Algiers",
          paragraphs: [
            "Nigerian participants join a virtual class delivered from the Algiers centre. They do not travel to a KOST address in Nigeria, because there is none. People who prefer a classroom can attend in person at Bab Ezzouar, in Algiers. KOST also has a presence in Paris; this Nigeria page does not place the course there.",
            "Tell us the cities the participants work from, how many people share the same duties, and the language required for the class. The written proposal confirms whether the virtual class from Algiers is the delivery, or whether travel to Bab Ezzouar is the practical choice.",
          ],
          subsections: [
            {
              title: "In-person training outside Algeria only after prior written IATA authorization",
              paragraphs: [
                "A classroom inside Nigeria is not a standard offer. It is studied only after prior written IATA authorization, and only together with the NCAA and operator requirements that apply to that session. Until those writings exist, do not plan on a KOST instructor on site in Nigeria. The Africa English hub states the same limit for other countries.",
              ],
            },
          ],
        },
        {
          id: "local",
          title: "Local requirements to verify before enrolment",
          paragraphs: [
            "The Nigerian Civil Aviation Authority (NCAA) and the operator's manuals are the local layer to check before enrolment. This page does not quote an NCAA regulation article, and it does not claim that a course delivered from Algiers is automatically recognised by the NCAA. Ask the operator, or the authority's current text, what they require for the role you want to train.",
            "If the operator's manual still uses an old IATA category number, send that page with the duty list. The old number is not mapped automatically onto a function 7.x. Recognition, where it matters, depends on the issuing path and on the rules in force at the time. It is confirmed in the proposal only to the extent the sources allow. Otherwise the proposal says what is still open.",
          ],
        },
        {
          id: "recurrent",
          title: "Recurrent training and the 24-month interval",
          paragraphs: [
            "The current IATA DGR provides for recurrent training at intervals not exceeding 24 months. Confirm the interval in the current edition and against NCAA or operator rules before you treat a previous course as still current. This page does not print an expiry date.",
            "Recurrency follows the duties people hold now, not the title they held when they were last trained. Functions 7.1 and 7.3 have their own recurrent notes on their pages. Other functions are scoped separately. A French explanation of the 24-month interval is on the French recyclage page, for teams that work in French.",
          ],
        },
        {
          id: "proposal",
          title: "How to request a written proposal",
          paragraphs: [
            "Write the duties, the Nigerian cities involved, any operator or NCAA reference you already rely on, and whether a previous course exists. Use the form, email cbta@kostacademy.com, or WhatsApp +213 542 305 383. The reply is written. The form may lead to a callback to clarify the request.",
            "The proposal will name the CBTA functions to examine, the virtual delivery from Algiers, and the points that still need a local check. It will not state that the NCAA has approved the session.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Is there a KOST DGR centre in Nigeria?",
          a: "No. Training for Nigerian teams is by virtual class from Algiers, or in person at Bab Ezzouar if participants travel there. In-person training in Nigeria requires prior written IATA authorization.",
        },
        {
          q: "Does the NCAA automatically recognise this course?",
          a: "No automatic recognition is claimed. Check NCAA and operator requirements before enrolment. The proposal will not invent that acceptance.",
        },
        {
          q: "Which function should a freight forwarder in Lagos take?",
          a: "Whichever of 7.1 to 7.10 matches the tasks. A forwarder who prepares consignments is not automatically on the same function as a person who accepts them.",
        },
        {
          q: "How do we ask for a proposal?",
          a: "To get started: the form on this page, cbta@kostacademy.com, or WhatsApp +213 542 305 383.",
        },
      ]}
      links={[
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/iata-dangerous-goods-training-algeria", label: "IATA DGR training Algeria" },
        { href: "/iata-dgr-course-ghana", label: "IATA DGR course Ghana" },
        { href: "/iata-dgr-course-kenya", label: "IATA DGR course Kenya" },
        { href: "/iata-dgr-recurrent-training", label: "IATA DGR recurrent training" },
        { href: "/formation-dgr-afrique", label: "Formation DGR Afrique (FR)" },
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois (FR)" },
        { href: "/entreprises", label: "Companies" },
        { href: "/contact", label: "Contact" },
        { href: "/dgr-7-1", label: "DGR 7.1" },
        { href: "/dgr-7-3", label: "DGR 7.3" },
      ]}
      crumbs={[
        { name: "Home", path: "" },
        { name: "IATA DGR course Nigeria", path: "/iata-dgr-course-nigeria" },
      ]}
      ctaTitle="Request a written proposal for Nigeria"
      ctaText="Describe the duties in Nigeria and any NCAA or operator document you already have. We reply in writing with the functions that can be scoped."
      whatsappMessage="Hello, I would like a written proposal for an IATA DGR course for a team in Nigeria."
    />
  );
}
