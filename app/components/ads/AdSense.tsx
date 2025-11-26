'use client';
import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: string;
  adStyle?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
  testMode?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSense({
  adSlot,
  adFormat = 'auto',
  adStyle = { display: 'block' },
  className = '',
  responsive = true,
  testMode = false
}: AdSenseProps) {
  useEffect(() => {
    try {
      // Load AdSense script if not already loaded
      if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${
          process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4494254698131922'
        }`;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }

      // Initialize ads
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense loading error:', error);
    }
  }, [adSlot, testMode]);

  return (
    <ins
      className={`adsbygoogle ${className}`}
      style={adStyle}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-4494254698131922'}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
