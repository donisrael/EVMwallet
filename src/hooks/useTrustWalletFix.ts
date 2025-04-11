// src/hooks/useTrustWalletFix.ts
import { useEffect } from "react";
import { useWalletClient, useAccount } from "wagmi";

export function useTrustWalletFix() {
  const { data: walletClient } = useWalletClient();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (!isConnected) return;
    
    const provider = (walletClient?.transport as any)?.provider;
    if (!provider?.on) return;

    let reloadTimer: NodeJS.Timeout;

    const handleSessionUpdate = () => {
      console.log("🔄 Wallet session updated");
      // Delay reload to allow all state updates to propagate
      reloadTimer = setTimeout(() => {
        if (window.performance.navigation.type !== 1) { // Avoid infinite reload
          window.location.reload();
        }
      }, 1000);
    };

    const handleConnect = () => {
      console.log("✅ Wallet connected");
      // Only reload if we detect Trust Wallet mobile
      if (/TrustWallet|TW/i.test(navigator.userAgent)) {
        handleSessionUpdate();
      }
    };

    const handleDisconnect = () => {
      console.log("❌ Wallet disconnected");
      clearTimeout(reloadTimer);
    };

    // Add mobile-specific event listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSessionUpdate();
      }
    };

    provider.on("session_update", handleSessionUpdate);
    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);
    window.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      provider.off("session_update", handleSessionUpdate);
      provider.off("connect", handleConnect);
      provider.off("disconnect", handleDisconnect);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      clearTimeout(reloadTimer);
    };
  }, [walletClient, isConnected]);
}