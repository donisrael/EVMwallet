// hooks/useAutoSwitchChain.ts

import { useState } from "react";
import { useSwitchChain } from "wagmi";

export default function useAutoSwitchChain() {
  const [isSwitching, setIsSwitching] = useState(false);
  const { switchChain } = useSwitchChain();

  const handleSwitchChain = async (newChainId: number) => {
    setIsSwitching(true);
    try {
      await switchChain({ chainId : newChainId});  // Switch to the new network
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return {
    switchChain: handleSwitchChain,
    isSwitching,
  };
}

