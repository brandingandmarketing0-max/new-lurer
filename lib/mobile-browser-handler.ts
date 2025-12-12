/**
 * Mobile Browser Handler
 * 
 * Attempts to open links in the device's default browser (Safari/Chrome)
 * instead of staying in in-app browsers (Instagram, Facebook, etc.)
 * 
 * Note: iOS Instagram webviews are heavily restricted. Some methods may not work
 * due to Apple's security policies. This utility tries all available techniques.
 */

import { UAParser } from 'ua-parser-js';

export interface BrowserDetection {
  isMobile: boolean;
  isAndroid: boolean;
  isiOS: boolean;
  isInstagram: boolean;
  isFacebookInApp: boolean;
  isInAppBrowser: boolean;
  reasons: string;
  ua: string;
  deviceType?: string;
  osName?: string;
  browserName?: string;
}

/**
 * Detect if user is in an in-app browser
 */
export function detectInAppBrowser(): BrowserDetection {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  
  const parser = new UAParser(ua);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();
  
  const isAndroid = os.name?.toLowerCase() === 'android';
  const isiOS = os.name?.toLowerCase() === 'ios' || /iphone|ipad|ipod/.test(ua.toLowerCase());
  const isMobile = device.type === 'mobile' || isAndroid || isiOS;

  const uaLower = ua.toLowerCase();
  const isInstagram = /instagram/.test(uaLower);
  const isFacebookInApp = /fbav|fban|facebook/.test(uaLower);
  const isTwitter = /twitter/.test(uaLower);
  const isTikTok = /tiktok/.test(uaLower);
  const isSnapchat = /snapchat/.test(uaLower);
  const isLinkedIn = /linkedinapp/.test(uaLower);
  const isWhatsApp = /whatsapp/.test(uaLower);
  
  const ref = typeof document !== 'undefined' ? document.referrer.toLowerCase() : '';
  const refIsInstagram = /instagram\.com/.test(ref);
  const refIsFacebook = /facebook\.com/.test(ref);

  const hasSafari = /safari/.test(uaLower) && !/chrome/.test(uaLower);
  const isStandalone = typeof (window as any).navigator !== 'undefined' && !!(window as any).navigator.standalone;
  const isWebviewIOSSuspect = isiOS && !hasSafari && !isStandalone;

  let windowOpenBlocked = false;
  try {
    const w = typeof window !== 'undefined' ? window.open('', '_blank') : null;
    if (!w) windowOpenBlocked = true;
    else w.close();
  } catch (e) {
    windowOpenBlocked = true;
  }

  const isInAppBrowser = isInstagram || isFacebookInApp || isTwitter || isTikTok || 
                        isSnapchat || isLinkedIn || isWhatsApp || 
                        isWebviewIOSSuspect || windowOpenBlocked || 
                        refIsInstagram || refIsFacebook;

  const reasons: string[] = [];
  if (isInstagram) reasons.push('ua:instagram');
  if (isFacebookInApp) reasons.push('ua:facebook');
  if (isTwitter) reasons.push('ua:twitter');
  if (isTikTok) reasons.push('ua:tiktok');
  if (isSnapchat) reasons.push('ua:snapchat');
  if (isLinkedIn) reasons.push('ua:linkedin');
  if (isWhatsApp) reasons.push('ua:whatsapp');
  if (isWebviewIOSSuspect) reasons.push('ios-no-safari-in-ua');
  if (windowOpenBlocked) reasons.push('window.open-blocked');
  if (refIsInstagram) reasons.push('referrer-instagram');
  if (refIsFacebook) reasons.push('referrer-facebook');

  return {
    isMobile,
    isAndroid,
    isiOS,
    isInstagram,
    isFacebookInApp,
    isInAppBrowser,
    reasons: reasons.join('|') || 'none',
    ua,
    deviceType: device.type || 'unknown',
    osName: os.name || 'unknown',
    browserName: browser.name || 'unknown',
  };
}

/**
 * Attempt to open URL in default browser (all techniques)
 */
export async function openInDefaultBrowser(url: string, detection: BrowserDetection): Promise<boolean> {
  // Android: Try intent URL
  if (detection.isAndroid) {
    try {
      const urlWithoutProtocol = url.replace(/^https?:\/\//, '');
      const intentUrl = `intent://${urlWithoutProtocol}#Intent;scheme=https;package=com.android.chrome;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;S.browser_fallback_url=${encodeURIComponent(url)};end`;
      window.location.href = intentUrl;
      return true;
    } catch (e) {
      // Continue
    }
  }

  // iOS: Try multiple methods
  if (detection.isiOS) {
    // Method 1: window.open
    try {
      const w = window.open(url, '_blank', 'noopener,noreferrer');
      if (w) return true;
    } catch (e) {}

    // Method 2: location.replace (most reliable after delay)
    try {
      window.location.replace(url);
      return true;
    } catch (e) {}

    // Method 3: location.href
    try {
      window.location.href = url;
      return true;
    } catch (e) {}
  }

  // Fallback: window.open for all
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Link.me style redirect - shows loading then redirects
 */
export function linkMeStyleRedirect(url: string, detection: BrowserDetection): void {
  if (!detection.isInAppBrowser || !detection.isMobile) return;

  // Add timestamp to make it a "new" navigation
  const redirectUrl = url + (url.includes('?') ? '&' : '?') + '_t=' + Date.now();

  setTimeout(() => {
    if (detection.isiOS) {
      window.location.replace(redirectUrl);
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 100);
    } else {
      openInDefaultBrowser(redirectUrl, detection);
    }
  }, 2000);
}

