import { useState, useCallback } from 'react';
import { checkNetwork, switchToSepoliaNetwork, getProvider, showToast } from '@/utils/web3Utils';

export const useWalletConnection = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showReconnectDialog, setShowReconnectDialog] = useState(false);

  const disconnect = useCallback(() => {
    setAccount(null);
    showToast("Disconnected", "Wallet disconnected");
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      showToast("MetaMask not found", "Please install MetaMask browser extension", "destructive");
      return;
    }

    try {
      setIsConnecting(true);
      await switchToSepoliaNetwork();
      
      const isCorrectNetwork = await checkNetwork();
      if (!isCorrectNetwork) {
        disconnect();
        return;
      }

      const provider = getProvider();
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
      setShowReconnectDialog(false);
      
      showToast("Connected!", "Successfully connected to MetaMask on Sepolia network");
    } catch (error) {
      console.error("Connection error:", error);
      showToast("Connection failed", "Failed to connect to MetaMask", "destructive");
    } finally {
      setIsConnecting(false);
    }
  }, [disconnect]);

  const handleAccountsChanged = useCallback(async (accounts: string[]) => {
    disconnect();
    setShowReconnectDialog(true);
    showToast(
      "Account Changed",
      "Please reconnect with the new account",
      "destructive"
    );
  }, [disconnect]);

  const handleChainChanged = useCallback(() => {
    disconnect();
    setShowReconnectDialog(true);
    showToast(
      "Network Changed",
      "Please connect to Sepolia network",
      "destructive"
    );
  }, [disconnect]);

  return {
    account,
    isConnecting,
    showReconnectDialog,
    setShowReconnectDialog,
    connect,
    disconnect,
    handleAccountsChanged,
    handleChainChanged
  };
};