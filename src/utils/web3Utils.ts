import { BrowserProvider } from "ethers";
import { toast } from "@/hooks/use-toast";

export const REQUIRED_CHAIN_ID = '0xaa36a7'; // Sepolia network

export const checkNetwork = async () => {
  if (!window.ethereum) return false;
  
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return chainId === REQUIRED_CHAIN_ID;
};

export const switchToSepoliaNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: REQUIRED_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: REQUIRED_CHAIN_ID,
          chainName: 'Sepolia',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://sepolia.infura.io/v3/'],
          blockExplorerUrls: ['https://sepolia.etherscan.io'],
        }],
      });
    }
  }
};

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }
  return new BrowserProvider(window.ethereum);
};

export const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
  });
};