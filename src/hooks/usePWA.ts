import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type BrowserType = 'chrome' | 'brave' | 'edge' | 'firefox' | 'safari' | 'ios-safari' | 'other';

function detectBrowser(): BrowserType {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check iOS first
  if (/ipad|iphone|ipod/.test(ua) && !('MSStream' in window)) {
    return 'ios-safari';
  }
  
  // Brave has a specific detection method
  if ((navigator as any).brave?.isBrave) {
    return 'brave';
  }
  
  // Check other browsers
  if (ua.includes('edg/')) return 'edge';
  if (ua.includes('chrome') && !ua.includes('edg/')) return 'chrome';
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  
  return 'other';
}

function isChromiumBased(browser: BrowserType): boolean {
  return ['chrome', 'brave', 'edge'].includes(browser);
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const [isPreviewEnv, setIsPreviewEnv] = useState(false);

  useEffect(() => {
    // Detect browser
    const detectedBrowser = detectBrowser();
    setBrowser(detectedBrowser);

    // Check if in preview/development environment
    const isPreview = window.location.hostname.includes('lovableproject.com') || 
                      window.location.hostname.includes('localhost');
    setIsPreviewEnv(isPreview);

    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // For Chromium browsers, assume installable even if prompt hasn't fired yet
    if (isChromiumBased(detectedBrowser) && !isStandalone) {
      setIsInstallable(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
        }
        
        setDeferredPrompt(null);
        return outcome === 'accepted';
      } catch (error) {
        console.error('Error installing app:', error);
        return false;
      }
    }
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    isIOS: browser === 'ios-safari',
    isSafari: browser === 'safari',
    isChromium: isChromiumBased(browser),
    browser,
    isPreviewEnv,
    hasPrompt: !!deferredPrompt,
    installApp,
  };
}
