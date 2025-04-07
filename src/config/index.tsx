import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum, sepolia, polygon, bsc} from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = "8fade08d8bd07cbc1dfccd1593c76c2d";


 // this is a public projectId only to use on localhost
 //"b56e18d47c72ab683b10814fe9495694"

if (!projectId) {
  throw new Error('Project ID is not defined');
}

export const metadata = {
    name: 'wallet connect',
    description: 'wallet connect',
    url: 'https://ev-mwallet.vercel.app/', // origin
    icons: ['https://avatars.githubusercontent.com/u/179229932']
  }

// for custom networks visit -> https://docs.reown.com/appkit/react/core/custom-networks
export const networks = [mainnet, arbitrum, polygon, bsc, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig