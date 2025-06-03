
import { useState, useCallback } from 'react';
import { parseEther } from 'ethers';
import { showToast } from '@/utils/web3Utils';
import { useContract } from './useContract';
import { getErrorMessage } from '@/utils/errorUtils';

export const useTokenPurchaseETH = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getContract } = useContract();

  const buyTokensWithETH = useCallback(async (amount: string) => {
    if (!window.ethereum || !account) {
      showToast("Not connected", "Please connect your wallet first", "destructive");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      const valueInWei = parseEther(amount);
      
      const tx = await contract.buyTokensWithETH({ value: valueInWei });
      await tx.wait();

      showToast("Success!", "Tokens successfully purchased with ETH");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      showToast("Transaction Error", errorMessage, "destructive");
    } finally {
      setIsLoading(false);
    }
  }, [account, getContract]);

  return {
    isLoading,
    buyTokensWithETH
  };
};
