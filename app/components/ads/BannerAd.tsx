'use client';

import AdSense from './AdSense';

interface BannerAdProps {
  position?: 'top' | 'bottom' | 'sidebar';
  className?: string;
  testMode?: boolean;
}

export default function BannerAd({ 
  position = 'top', 
  className = '',
  testMode = false 
}: BannerAdProps) {
  // Different ad slots for different positions
  const adSlots = {
    top: process.env.NEXT_PUBLIC_ADSENSE_TOP_BANNER || '',
    bottom: process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_BANNER || '',
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR || ''
  };

  const styles = {
    top: {
      width: '100%',
      minHeight: '90px',
      margin: '10px 0',
      textAlign: 'center' as const,
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    },
    bottom: {
      width: '100%',
      minHeight: '90px',
      margin: '10px 0',
      textAlign: 'center' as const,
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    },
    sidebar: {
      width: '300px',
      minHeight: '250px',
      margin: '10px auto',
      textAlign: 'center' as const,
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      backgroundColor: '#f9f9f9'
    }
  };

  // Don't render if no ad slot is configured
  if (!adSlots[position]) {
    return null;
  }

  return (
    <div className={`banner-ad banner-ad-${position} ${className}`}>
      <AdSense
        adSlot={adSlots[position]}
        adFormat="auto"
        adStyle={styles[position]}
        responsive={true}
        testMode={testMode}
      />
    </div>
  );
}
