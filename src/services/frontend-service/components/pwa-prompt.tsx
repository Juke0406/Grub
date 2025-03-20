"use client";

import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

function getPlatformInfo() {
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) ||
    "standalone" in navigator ||
    window.matchMedia("(display-mode: standalone)").matches;
  return { isIOS, isMobile };
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes("android-app://") ||
    window.location.href.includes("?mode=pwa") ||
    window.location.href.includes("?homescreen=1")
  );
}

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Don't show if already installed
    if (isStandalone()) return;

    // Only check cookie if not in standalone mode and browser supports installation
    const { isMobile } = getPlatformInfo();
    if (isMobile && window.matchMedia("(display-mode: browser)").matches) {
      const hasSeenPrompt = Cookies.get("pwa-prompt-seen");
      // If they've seen it recently, don't show again
      if (hasSeenPrompt) {
        const lastPrompt = parseInt(hasSeenPrompt);
        const now = Date.now();
        // Show prompt again after 7 days
        if (now - lastPrompt < 7 * 24 * 60 * 60 * 1000) {
          return;
        }
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the prompt
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if it's iOS
    const { isIOS } = getPlatformInfo();
    if (isIOS && !isStandalone()) {
      // Show iOS-specific install prompt
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // If it's iOS, just close the prompt as we can't programmatically install
    const { isIOS } = getPlatformInfo();
    if (isIOS) {
      handleDismiss();
      return;
    }

    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    // Clear the saved prompt since it can't be used again
    setDeferredPrompt(null);

    // Hide the prompt
    setShowPrompt(false);

    // Set cookie to not show again
    // Store timestamp of when prompt was shown/dismissed
    Cookies.set("pwa-prompt-seen", Date.now().toString(), { expires: 7 });
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Set cookie to not show again
    Cookies.set("pwa-prompt-seen", "true", { expires: 365 });
  };

  if (!showPrompt) return null;

  const { isIOS, isMobile } = getPlatformInfo();

  // Customize the message based on platform
  let installText =
    "Install our app for a better experience. You can access it anytime from your home screen.";
  if (isIOS) {
    installText =
      "To install, tap the share button below and select 'Add to Home Screen'";
  } else if (!isMobile) {
    installText =
      "Install our app for quick access and a better experience. Click Install to add it to your home screen.";
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800 md:left-auto md:right-4 md:w-96">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Install App
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {installText}
          </p>
          <div className="mt-4 flex space-x-4">
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Install
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              {isIOS ? "Got it" : "Maybe Later"}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
