"use client";

import { MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/formations";
import { trackWhatsApp } from "@/lib/tracking";

export default function WhatsAppSticky() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackWhatsApp("sticky")}
      aria-label="Discuter sur WhatsApp"
      className="md:hidden fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-2xl active:scale-95 transition-transform"
    >
      <MessageCircle className="h-7 w-7" aria-hidden />
    </a>
  );
}
