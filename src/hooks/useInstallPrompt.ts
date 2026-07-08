import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneMode(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(isStandaloneMode);

  useEffect(() => {
    setIsStandalone(isStandaloneMode());

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
    };

    const onDisplayMode = () => setIsStandalone(isStandaloneMode());

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window
      .matchMedia("(display-mode: standalone)")
      .addEventListener("change", onDisplayMode);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window
        .matchMedia("(display-mode: standalone)")
        .removeEventListener("change", onDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setPrompt(null);
    return outcome === "accepted";
  }, [prompt]);

  return { canInstall: prompt !== null, isStandalone, install };
}
