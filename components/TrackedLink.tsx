"use client";

import { AnchorHTMLAttributes, MouseEvent } from "react";
import { trackWhatsApp, trackPhoneClick } from "@/lib/tracking";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  track: "whatsapp" | "phone";
  location?: string;
};

/**
 * Drop-in replacement for <a> on WhatsApp/tel links inside server components
 * (pages exporting `metadata`) so the click still fires the Google Ads
 * conversion (trackWhatsApp / trackPhoneClick) without converting the whole
 * page to a client component.
 */
export default function TrackedLink({
  track,
  location,
  onClick,
  ...rest
}: Props) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (track === "whatsapp") trackWhatsApp(location);
    else trackPhoneClick();
    onClick?.(e);
  };

  return <a {...rest} onClick={handleClick} />;
}
