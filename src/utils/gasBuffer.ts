export const getGasBufferByChain = (chainId: number): number => {
    switch (chainId) {
      case 1: // Ethereum Mainnet
        return 0.0005; // ETH
      case 56: // BNB Smart Chain
        return 0.00004; // BNB
      case 137: // Polygon
        return 0.1; // MATIC
      case 42161: // Arbitrum
        return 0.0002; // ETH
      case 10: // Optimism
        return 0.0005; // ETH
      default:
        return 0.001; // Fallback default
    }
  };
  