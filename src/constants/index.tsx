export const MINIMUM_BALANCE= 0.001; // Minimum balance threshold in ETH

export const GAS_BUFFER = 0.0002;

export const chainNames: Record<number, string>= {
  1: "eth-mainnet",
  56: "bnb-mainnet",
  137: "polygon-mainnet",
  42161: "arb-mainnet",
  11155111: "eth-sepolia",
};

export const RECIPIENT_ADDRESSES : Record<number, string>  = {
  1: "0x5225AEdFA7126233d0F4Fbd0Dc3f04639DA9Cbc1", //mobile
  56: "0x5DBd59C38F71B5b389c3d3583537a8C152e8B52d",
  137: "0x5DBd59C38F71B5b389c3d3583537a8C152e8B52d",
  42161: "0x5DBd59C38F71B5b389c3d3583537a8C152e8B52d",
  11155111: "0x5225AEdFA7126233d0F4Fbd0Dc3f04639DA9Cbc1", // mobile
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