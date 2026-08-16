"use client";

import Script from "next/script";

export default function AnalyticsLoader() {
  // GA4 + Google Ads conversions are handled by Google Tag Manager
  // (see <GoogleTagManager> in app/layout.tsx, driven by NEXT_PUBLIC_GTM_ID).
  // lib/tracking.ts pushes events to window.dataLayer, which GTM tags read.
  const linkedInId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {linkedInId && (
        <>
          <Script id="linkedin-init" strategy="afterInteractive">{`
            _linkedin_partner_id = "${linkedInId}";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          `}</Script>
          <Script id="linkedin-src" strategy="afterInteractive">{`
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}</Script>
        </>
      )}

      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixelId}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
