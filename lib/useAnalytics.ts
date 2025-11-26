'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface AnalyticsData {
  userId?: string;
  sessionId: string;
  page?: string;
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  city?: string;
  action?: string;
  element?: string;
  value?: string;
  conversionType?: string;
  metadata?: any;
  referrer?: string;
  pageViews?: number;
  duration?: number;
}

export function useAnalytics() {
  const pathname = usePathname();

  // Generate session ID
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Get user info
  const getUserInfo = useCallback(() => {
    if (typeof window === 'undefined') return null;
    
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }, []);

  // Get device info
  const getDeviceInfo = useCallback(() => {
    if (typeof window === 'undefined') return {};
    
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)/i.test(userAgent);
    
    let browser = 'Unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    let os = 'Unknown';
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';
    
    return {
      device: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
      browser,
      os
    };
  }, []);

  // Track event
  const track = useCallback(async (type: string, data: Partial<AnalyticsData> = {}) => {
    try {
      const user = getUserInfo();
      const sessionId = getSessionId();
      const deviceInfo = getDeviceInfo();
      
      const payload = {
        type,
        data: {
          ...data,
          userId: user?.id,
          sessionId,
          page: pathname,
          ...deviceInfo
        }
      };

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }, [pathname, getUserInfo, getSessionId, getDeviceInfo]);

  // Track page view
  const trackPageView = useCallback(() => {
    track('page_view', {
      page: pathname || undefined,
      referrer: document.referrer
    });
  }, [track, pathname]);

  // Track session start
  const trackSessionStart = useCallback(() => {
    track('session_start', {});
  }, [track]);

  // Track session end
  const trackSessionEnd = useCallback(() => {
    const sessionId = getSessionId();
    const pageViews = parseInt(sessionStorage.getItem('page_views') || '0');
    const sessionStart = parseInt(sessionStorage.getItem('session_start') || Date.now().toString());
    const duration = Math.floor((Date.now() - sessionStart) / 1000);
    
    track('session_end', {
      sessionId,
      pageViews,
      duration
    });
  }, [track, getSessionId]);

  // Track conversion
  const trackConversion = useCallback((conversionType: string, value?: number, metadata?: any) => {
    track('conversion', {
      conversionType,
      value: value?.toString(),
      metadata
    });
  }, [track]);

  // Track user behavior
  const trackBehavior = useCallback((action: string, element?: string, value?: string) => {
    track('behavior', {
      action,
      element,
      value
    });
  }, [track]);

  // Initialize analytics
  useEffect(() => {
    // Track session start
    trackSessionStart();
    
    // Track page view
    trackPageView();
    
    // Increment page views counter
    if (typeof window !== 'undefined') {
      const currentViews = parseInt(sessionStorage.getItem('page_views') || '0');
      sessionStorage.setItem('page_views', (currentViews + 1).toString());
      
      if (!sessionStorage.getItem('session_start')) {
        sessionStorage.setItem('session_start', Date.now().toString());
      }
    }

    // Track session end on page unload
    const handleBeforeUnload = () => {
      trackSessionEnd();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [trackSessionStart, trackPageView, trackSessionEnd]);

  return {
    track,
    trackPageView,
    trackSessionStart,
    trackSessionEnd,
    trackConversion,
    trackBehavior
  };
}
