import type { Metadata } from "next";
import ExactMatchPage from "@/components/ExactMatchPage";
import { OFFICIAL_EN, exactMatchMetadata } from "@/lib/exact-match";

const title = "IATA DGR recurrent training | 24-month cycle";
const description =
  "IATA DGR recurrent training and the 24-month interval: scope the CBTA function and request a written proposal. No invented expiry date.";

export const metadata: Metadata = exactMatchMetadata({
  title,
  description,
  slug: "iata-dgr-recurrent-training",
  locale: "en",
  keywords: ["IATA DGR recurrent training", "DGR 24 month recurrent", "CBTA recurrent training", "dangerous goods refresher"],
  languages: {
    en: "/iata-dgr-recurrent-training",
    fr: "/recyclage-dgr-24-mois",
  },
});

export default function Page() {
  return (
    <ExactMatchPage
      lang="en"
      slug="iata-dgr-recurrent-training"
      eyebrow="24-month interval · not an expiry date"
      h1="IATA DGR recurrent training"
      description={description}
      lead={[
        "IATA DGR recurrent training: the current IATA DGR provides for recurrent training at intervals not exceeding 24 months, to be confirmed in the current edition and against the authority or operator rules that apply.",
        `KOST Academy, a ${OFFICIAL_EN}, scopes that recurrent training from current duties, in person in Algiers or by virtual class from Algiers. This page does not publish an expiry date and does not show a fee. The French page is recyclage DGR 24 mois.`,
      ]}
      sections={[
        {
          id: "meaning",
          title: "What IATA DGR recurrent training means",
          paragraphs: [
            "The phrase « 24 months » is an interval between training events for a function, as provided in the IATA DGR. It is not a calendar date printed on this page, and it is not an invented end date for a previous document. The current edition must be read before an employer announces a deadline to a team. An operator rule or a competent authority may organise the follow-up more tightly. Until those sources are open, the interval stays « to be confirmed ».",
            "The public ANAC guide for Algerian operators seeking a dangerous-goods approval mentions recurrent training with the words « 24 months » inside the operator's training programme, to be set out in the operations manual. That sentence is about the guide's operator file. It does not replace the IT 38-25 or the current DGR edition. It shows that the same interval appears in a public Algerian source, which still has to be read in context.",
            "If you hold an earlier record, send the date and the function or old category. The proposal will say what can be confirmed and what must still be checked. It will not convert the interval into a published expiry.",
          ],
        },
        {
          id: "confirm",
          title: "Confirm the current IATA DGR edition and any authority or operator rule",
          paragraphs: [
            "Three readings sit side by side. First, the DGR edition the company actually uses. Second, the authority text that applies: for work in Algeria, IT No. 38-25 of 13 February 2025, listed by ANAC as relating to the safety of air transport of dangerous goods. Third, the operator manual, when it already names a programme or a role.",
            "If those sources diverge, the proposal says so. ICAO Annex 18 and Doc 9284 remain the usual international technical references, in the version in force. This page does not summarise them article by article. For Nigeria, Ghana or Kenya, add the NCAA, GCAA or KCAA check described on those country pages. Nothing here claims that a recurrent course is automatically accepted by those authorities.",
          ],
        },
        {
          id: "cbta",
          title: "Recurrency under CBTA: the function follows current duties",
          paragraphs: [
            "Recurrent training is not an automatic renewal of the previous title. Duties may have changed. A person who moved from preparing consignments to acceptance, or from the warehouse to baggage screening, is no longer on the same function. CBTA starts again from the tasks performed now, then keeps the matching function from 7.1 to 7.10.",
            "An old category number is not a synonym. The French category 6 page explains the acceptance label most often requested, without an automatic link to function 7.3. The same caution applies in English.",
          ],
        },
        {
          id: "who",
          title: "Who should plan a recurrent course",
          paragraphs: [
            "Shippers and forwarders who prepare consignments, acceptance staff, warehouse and handling teams, people in contact with passengers and baggage, load planners, flight crew, cabin crew, dispatchers and security staff may all have a recurrent course to plan. The shared point is not the job title. It is having been trained for a function whose tasks they still perform, and approaching the interval in the applicable source.",
            "Someone newly assigned to dangerous-goods tasks is on an initial course, even if colleagues in the same company are renewing. Both can be in one proposal if they are described separately. Functions 7.1 and 7.3 have recurrent sections on their own pages. Other functions are scoped on their own pages. The layout of 7.1 is not copied onto 7.2 to 7.10.",
          ],
        },
        {
          id: "delivery",
          title: "Delivery: virtual classes from Algiers, or in-person in Algiers",
          paragraphs: [
            "In-person training at the centre is in Algiers, 176 Cité Boushaki, Bab Ezzouar. Virtual classes are delivered from that centre. KOST also has a presence in Paris; this recurrent page does not schedule the course there. Inside Algeria, an in-house session at the client's site is the other option. There is no KOST centre in Oran or in other Algerian cities.",
            "Outside Algeria, the virtual class from Algiers is the delivery that can be described. In-person training abroad is studied only after prior written IATA authorization and a check of the local authority. It is not offered as a default.",
          ],
        },
        {
          id: "proposal",
          title: "How to request a written proposal",
          paragraphs: [
            "Prepare the participant list, current duties, the previous function or category, the date of that session, the DGR edition if you know it, and any written operator requirement. State the preferred delivery. A short message is enough to start.",
            "Write through the form, to cbta@kostacademy.com, or on WhatsApp +213 542 305 383. The reply is written. A phone appointment is not offered. The French explanation of the same interval is on recyclage DGR 24 mois.",
          ],
        },
      ]}
      faqs={[
        {
          q: "Is the 24-month cycle an expiry date?",
          a: "No. It is a maximum interval in the IATA DGR, to be confirmed in the current edition and against the authority or operator. This page does not publish an end date.",
        },
        {
          q: "Does an old category renew under the same number?",
          a: "No. Current duties decide the function from 7.1 to 7.10. The old number is not applied automatically.",
        },
        {
          q: "Where can the course be delivered?",
          a: "In person at Bab Ezzouar, in-house at the client in Algeria, or by virtual class from Algiers. Outside Algeria, in-person delivery needs prior written IATA authorization.",
        },
        {
          q: "Where is the French page?",
          a: "Recyclage DGR 24 mois. The two pages are linked as language versions of the same subject.",
        },
      ]}
      links={[
        { href: "/recyclage-dgr-24-mois", label: "Recyclage DGR 24 mois (FR)" },
        { href: "/cbta-dgr-training-africa", label: "CBTA DGR training Africa" },
        { href: "/dgr-7-1#recyclage", label: "Function 7.1 recurrent" },
        { href: "/dgr-7-3#recyclage", label: "Function 7.3 recurrent" },
        { href: "/iata-dangerous-goods-training-algeria", label: "IATA DGR training Algeria" },
        { href: "/iata-dgr-course-nigeria", label: "Nigeria" },
        { href: "/entreprises", label: "Companies" },
        { href: "/contact", label: "Contact" },
        { href: "/planning", label: "Schedule" },
      ]}
      crumbs={[
        { name: "Home", path: "" },
        { name: "IATA DGR recurrent training", path: "/iata-dgr-recurrent-training" },
      ]}
      ctaTitle="Request a written recurrent proposal"
      ctaText="Send the previous session date and the duties people hold now. The function is confirmed from those facts."
      whatsappMessage="Hello, I would like a written proposal for IATA DGR recurrent training."
    />
  );
}
