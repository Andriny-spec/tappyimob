import Script from "next/script";

// Fallback — usado se ainda não houver configuração salva em
// SystemConfig (editável em /admin/marketing/configuracoes).
const DEFAULT_GTM_ID = "GTM-M94LJHT";
const DEFAULT_GA4_ID = "G-RSWFRX3J7D";
const DEFAULT_FB_PIXEL_ID = "166571789168288";

interface TrackingScriptsProps {
  gtmId?: string;
  ga4Id?: string;
  metaPixelId?: string;
}

export function TrackingScripts({
  gtmId = DEFAULT_GTM_ID,
  ga4Id = DEFAULT_GA4_ID,
  metaPixelId = DEFAULT_FB_PIXEL_ID,
}: TrackingScriptsProps = {}) {
  const GTM_ID = gtmId;
  const GA4_ID = ga4Id;
  const FB_PIXEL_ID = metaPixelId;
  return (
    <>
      {/* Google Tag Manager - Head */}
      <Script
        id="gtm-script"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `,
        }}
      />

      {/* Google Analytics 4 */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
        strategy="lazyOnload"
      />
      <Script
        id="ga4-config"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA4_ID}', {
              page_title: document.title,
              page_location: window.location.href,
            });
          `,
        }}
      />

      {/* Facebook/Meta Pixel */}
      <Script
        id="fb-pixel"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
    </>
  );
}

export function GTMNoScript({ gtmId = DEFAULT_GTM_ID }: { gtmId?: string } = {}) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
