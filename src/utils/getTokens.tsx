import { ethers } from "ethers";
import { CHAIN_TO_ALCHEMY_NETWORK } from "../constants"

const ALCHEMY_API_KEY = "FFIN14q8BPa1YQBXP-ABWpyr4Je_fr87"; // Replace with env variable
const ALCHEMY_URL = (network: string) => `https://${network}.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

/**
 * Fetch ERC-20 tokens with non-zero balances
 * @param walletAddress - The wallet address to check
 */
export async function getTokensWithBalance(walletAddress: string, chainId: number) {

  const network = CHAIN_TO_ALCHEMY_NETWORK[chainId];
  if (!network) {
    console.warn("Unsupported network for token balance");
    return [];
  }
  try {
    const response = await fetch(ALCHEMY_URL(network), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenBalances",
        params: [walletAddress, "erc20"],
      }),
    });

    const data = await response.json();
    if (!Array.isArray(data.result?.tokenBalances)) return [];

    const tokens = await Promise.all(
      data.result.tokenBalances
        .filter((token: any) => token.tokenBalance !== "0x0")
        .map(async (token: any) => {
          const metadata = await fetchTokenMetadata(token.contractAddress, network);
          return {
            contractAddress: token.contractAddress,
            balance: ethers.formatUnits(token.tokenBalance, metadata.decimals || 18),
            name: metadata.name || "Unknown Token",
            symbol: metadata.symbol || "???",
            decimals: metadata.decimals || 18,
          };
        })
    );

    return tokens;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return [];
  }
}

/**
 * Fetch ERC-20 token metadata (name, symbol, decimals)
 * @param contractAddress - The contract address of the token
 */
async function fetchTokenMetadata(contractAddress: string, network: string) {
  try {
    const response = await fetch(ALCHEMY_URL(network), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "alchemy_getTokenMetadata",
        params: [contractAddress],
      }),
    });

    const data = await response.json();
    return data.result || {};
  } catch (error) {
    console.error("Error fetching token metadata:", error);
    return {};
  }
}
