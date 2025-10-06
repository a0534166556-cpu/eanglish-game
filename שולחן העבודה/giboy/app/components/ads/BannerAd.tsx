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
    top: testMode ? '1234567890' : (process.env.NEXT_PUBLIC_ADSENSE_TOP_BANNER || '1234567890'),
    bottom: testMode ? '0987654321' : (process.env.NEXT_PUBLIC_ADSENSE_BOTTOM_BANNER || '0987654321'),
    sidebar: testMode ? '1122334455' : (process.env.NEXT_PUBLIC_ADSENSE_SIDEBAR || '1122334455')
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
