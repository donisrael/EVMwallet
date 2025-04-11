import { createAppKit } from "@reown/appkit/react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { projectId, metadata, networks, wagmiAdapter } from "./config";
import "./App.css";
import CheckWalletBalance from "./components/CheckWalletBalance";
import { useTrustWalletFix } from "./hooks/useTrustWalletFix"; // Import the hook

const queryClient = new QueryClient();

// Initialize AppKit
createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks,
  metadata,
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#4F46E5",
  },
  features: { analytics: true },
});

function WalletComponent() {
  // Apply the Trust Wallet fix hook here
  useTrustWalletFix();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-6 transition-all">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-wide text-gray-200">EWallet Connect</h1>
        <p className="text-gray-400 mt-2">Manage your crypto assets securely</p>
      </div>
      <appkit-button></appkit-button>
      <CheckWalletBalance />
    </div>
  );
}

export function App() {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <WalletComponent />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;