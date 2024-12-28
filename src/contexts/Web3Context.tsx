import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, Contract, JsonRpcSigner } from 'ethers';
import { useToast } from '@/components/ui/use-toast';

interface Web3ContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  account: string | null;
  isConnecting: boolean;
  buyToken: () => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

// Example ABI for the buy function
const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsConnecting(true);
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      toast({
        title: "Connected!",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    toast({
      title: "Disconnected",
      description: "Wallet disconnected",
    });
  };

  const buyToken = async () => {
    if (!window.ethereum || !account) {
      toast({
        title: "Not connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.buy({ value: "10000000000000000" }); // 0.01 ETH
      await tx.wait();

      toast({
        title: "Success!",
        description: "Transaction completed successfully",
      });
    } catch (error) {
      console.error("Buy error:", error);
      toast({
        title: "Transaction failed",
        description: "Failed to complete the purchase",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setAccount(accounts[0] || null);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        account,
        isConnecting,
        buyToken,
        isLoading,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}