import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserProvider, Contract, parseEther, parseUnits } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Web3ContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  account: string | null;
  isConnecting: boolean;
  buyTokensWithETH: (amount: string) => Promise<void>;
  buyTokensWithUSDT: (amount: string) => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

const CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_usdtAddress","type":"address"},{"internalType":"uint256","name":"_tokenPriceUSDTinWei","type":"uint256"},{"internalType":"uint256","name":"_hardCap","type":"uint256"},{"internalType":"uint256","name":"_startTime","type":"uint256"},{"internalType":"uint256","name":"_endTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensUnsold","type":"uint256"}],"name":"ICOEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentMethod","type":"string"}],"name":"TokensPurchased","type":"event"},{"inputs":[{"internalType":"uint256","name":"TokenPriceInUSDT","type":"uint256"}],"name":"GetTokenPriceInWeiForETH","outputs":[{"internalType":"uint256","name":"priceInWei","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"buyTokensWithETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"usdtAmount","type":"uint256"}],"name":"buyTokensWithUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endICO","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"endTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getLatestPrice","outputs":[{"internalType":"int256","name":"","type":"int256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"hardCap","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"startTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokenPriceUSDTinWei","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"tokensSold","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"usdt","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}];

const CONTRACT_ADDRESS = "0x0488F8b7Fd2F2F601f3fc2BBC6C0486E71B8109c";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);
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
      
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xaa36a7' }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            }],
          });
        }
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setShowReconnectDialog(false);
      toast({
        title: "Connected!",
        description: "Successfully connected to MetaMask on Sepolia network",
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

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect();
      setShowReconnectDialog(true);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      toast({
        title: "Account Changed",
        description: "Wallet account has been changed",
      });
    }
  };

  const handleChainChanged = () => {
    window.location.reload();
  };

  const handleDisconnect = () => {
    disconnect();
    setShowReconnectDialog(true);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
      window.ethereum.on("disconnect", handleDisconnect);

      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
        })
        .catch(console.error);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, []);

  const buyTokensWithETH = async (amount: string) => {
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

      const valueInWei = parseEther(amount);
      
      const tx = await contract.buyTokensWithETH({ value: valueInWei });
      await tx.wait();

      toast({
        title: "Success!",
        description: "Successfully purchased tokens with ETH",
      });
    } catch (error) {
      console.error("Buy error:", error);
      toast({
        title: "Transaction failed",
        description: "Failed to complete the purchase with ETH",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buyTokensWithUSDT = async (amount: string) => {
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

      const amountInWei = parseUnits(amount, 6);
      
      const tx = await contract.buyTokensWithUSDT(amountInWei);
      await tx.wait();

      toast({
        title: "Success!",
        description: "Successfully purchased tokens with USDT",
      });
    } catch (error) {
      console.error("Buy error:", error);
      toast({
        title: "Transaction failed",
        description: "Failed to complete the purchase with USDT",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Web3Context.Provider
      value={{
        connect,
        disconnect,
        account,
        isConnecting,
        buyTokensWithETH,
        buyTokensWithUSDT,
        isLoading,
      }}
    >
      <AlertDialog open={showReconnectDialog} onOpenChange={setShowReconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wallet Disconnected</AlertDialogTitle>
            <AlertDialogDescription>
              Your wallet has been disconnected. Would you like to reconnect?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={connect}>
              Reconnect Wallet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
