// hooks/useAutoSwitchChain.ts

import { useState } from "react";
import { useSwitchChain } from "wagmi";

export default function useAutoSwitchChain() {
  const [isSwitching, setIsSwitching] = useState(false);
  const { switchChain } = useSwitchChain();

  const handleSwitchChain = async (newChainId: number, retries = 2): Promise<boolean> => {
    setIsSwitching(true);
    let attempt = 0;
    let lastError: any;

    // Detect Trust Wallet
    const isTrustWallet = window.ethereum?.isTrust;

    while (attempt <= retries) {
      try {
        await switchChain({ chainId: newChainId });
        console.log(`✅ Switched to chain ${newChainId}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`⚠️ Attempt ${attempt + 1} failed to switch to chain ${newChainId}:`, error);
        attempt++;
        if (isTrustWallet && error.code === 4001) { // User rejected request
          console.warn("Trust Wallet detected, retrying chain switch...");
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait before retry
        }
      }
    }

    console.error(`❌ Failed to switch to chain ${newChainId} after ${retries} attempts:`, lastError);
    setIsSwitching(false);
    throw new Error(`Failed to switch to chain ${newChainId}: ${lastError.message}`);
  };

  return {
    switchChain: handleSwitchChain,
    isSwitching,
  };
}