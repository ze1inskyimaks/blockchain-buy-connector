import React, { createContext, useContext, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useWalletConnection } from '@/hooks/useWalletConnection';
import { useTokenPurchase } from '@/hooks/useTokenPurchase';

interface Web3ContextType {
  connect: () => Promise<void>;
  disconnect: () => void;
  account: string | null;
  isConnecting: boolean;
  buyTokensWithETH: (amount: string) => Promise<void>;
  buyTokensWithUSDT: (amount: string) => Promise<void>;
  isLoading: boolean;
  tokenPrice: string;
  estimatedTokens: string;
  calculateTokenAmount: (amount: string, paymentMethod: 'eth' | 'usdt') => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const {
    account,
    isConnecting,
    showReconnectDialog,
    setShowReconnectDialog,
    connect,
    disconnect,
    handleAccountsChanged,
    handleChainChanged
  } = useWalletConnection();

  const { isLoading, buyTokensWithETH, buyTokensWithUSDT, tokenPrice, estimatedTokens, calculateTokenAmount, fetchTokenPrice } = useTokenPurchase(account);

  useEffect(() => {
    if (account) {
      fetchTokenPrice();
    }
  }, [account, fetchTokenPrice]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [handleAccountsChanged, handleChainChanged]);

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
        tokenPrice,
        estimatedTokens,
        calculateTokenAmount,
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