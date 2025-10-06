import type { Metadata } from "next";
import './globals.css';
import Navbar from './components/common/Navbar';

export const metadata: Metadata = {
  title: "Learning English - משחקי אנגלית",
  description: "למדו אנגלית בדרך הכי כיפית ומהנה! משחקים אינטראקטיביים, רמות מותאמות אישית, וחנות פרסים מיוחדת.",
  keywords: "אנגלית, משחקים, לימוד, חינוך, משחקי מילים, חידונים",
  authors: [{ name: "English Learning Game" }],
  creator: "English Learning Game",
  publisher: "English Learning Game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://68dc346c20a931be6fe60abb--coruscating-kulfi-0166b4.netlify.app'),
  alternates: {
    canonical: '/',
  },
  verification: {
    google: "ca-pub-4494254698131922",
  },
  openGraph: {
    title: "Learning English - משחקי אנגלית",
    description: "למדו אנגלית בדרך הכי כיפית ומהנה! משחקים אינטראקטיביים, רמות מותאמות אישית, וחנות פרסים מיוחדת.",
    url: 'https://english-learning-game.vercel.app',
    siteName: 'English Learning Game',
    images: [
      {
        url: '/icons/icon-512x512.svg',
        width: 512,
        height: 512,
        alt: 'English Learning Game',
      },
    ],
    locale: 'he_IL',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Learning English - משחקי אנגלית",
    description: "למדו אנגלית בדרך הכי כיפית ומהנה! משחקים אינטראקטיביים, רמות מותאמות אישית, וחנות פרסים מיוחדת.",
    images: ['/icons/icon-512x512.svg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'English Learning Game',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#3B82F6',
    'msapplication-config': '/browserconfig.xml',
    'theme-color': '#8B5CF6',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4494254698131922" crossOrigin="anonymous"></script>
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.svg" />
        <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.svg" />
        <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.svg" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.svg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.svg" />
        <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.svg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#8B5CF6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="English Learning Game" />
        <meta name="msapplication-TileColor" content="#3B82F6" />
        <meta name="msapplication-TileImage" content="/icons/icon-192x192.svg" />
        <meta name="application-name" content="English Learning Game" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="google-adsense-account" content="ca-pub-4494254698131922" />
      </head>
      <body>
        <Navbar />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
