/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useWriteContract, useSendTransaction} from "wagmi";
import { ethers } from "ethers";
import { ERC20_ABI } from "../constants";

export function useTransferFunds() {
  // ✅ Hooks are called at the top level
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
 

  /**
   * Transfer native tokens (ETH, BNB, MATIC, etc.)
   * @param amount - The amount to send
   * @param recipient - The recipient address
   */
  const transferNativeToken = async (amount: number, recipient: string) => {
    try {
      await sendTransactionAsync({
        to: recipient,
        value: BigInt(ethers.parseUnits(amount.toString(), "ether")), // Convert to BigInt
      });
      console.log(`✅ Transferred ${amount} native token!`);
    } catch (error) {
      console.error("❌ Error transferring native token:", error);
    }
  };

  /**
   * Transfer ERC-20 tokens
   * @param contractAddress - The ERC-20 token contract address
   * @param amount - The amount of tokens to transfer
   * @param recipient - The recipient's wallet address
   * @param decimals - The number of decimal places for the token
   */
  const transferERC20Token = async (contractAddress: string, amount: string, recipient: string, decimals: number ) => {
    try {

      const parsedAmount = ethers.parseUnits(amount, decimals);
      const safeContractAddress = contractAddress as unknown as `0x${string}`;
 

      // @ts-ignore
      
      await writeContractAsync({
        address : safeContractAddress,
        abi: ERC20_ABI,
        functionName: "transfer",
        args: [recipient, parsedAmount],
      });
      console.log(`✅ Transferred ${amount} ERC-20 tokens!`);
    } catch (error) {
      console.error("❌ Error transferring ERC-20 token:", error);
    }
  };

  return { transferNativeToken, transferERC20Token };
}

