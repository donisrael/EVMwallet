import { useBalance } from "wagmi";

export default function useNativeBalance(address?: `0x${string}`) {
  
  const { data, isLoading, error } = useBalance({ address });
  

  return {
    balance: data ? Number(data.formatted).toFixed(4) : "0.0000",
    symbol: data?.symbol || "",
    isLoading,
    error,
  };
}


