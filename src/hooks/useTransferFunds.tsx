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
  const MINIMUM_TRANSFER_AMOUNT = 0.001; // Minimum amount to transfer (in native token)

  const transferNativeToken = async (amount: number, recipient: string, options: { timeout?: number } = {}) => {
    const { timeout = 30000 } = options; // Default 30s timeout

    if (amount < MINIMUM_TRANSFER_AMOUNT) {
      throw new Error(`Amount ${amount} is below minimum transfer threshold (${MINIMUM_TRANSFER_AMOUNT})`);
    }

    try {
      const roundedAmount = parseFloat(amount.toFixed(18));
      const value = ethers.parseUnits(roundedAmount.toString(), "ether");
    

      const txPromise = sendTransactionAsync({
        to: recipient,
        value: BigInt(value),
      });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Transaction approval timed out")), timeout)
      );
  
      const tx = await Promise.race([txPromise, timeoutPromise]);
      return tx;
    } catch (error) {
      console.error("❌ Error transferring native token:", error);
      throw error; // Propagate error to caller
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

