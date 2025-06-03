
import { useState, useCallback } from 'react';
import { parseUnits, Contract } from 'ethers';
import { showToast } from '@/utils/web3Utils';
import { useContract } from './useContract';
import { getErrorMessage } from '@/utils/errorUtils';
import { USDT_CONTRACT_ADDRESS, USDT_ABI } from '@/constants/contractConfig';

export const useTokenPurchaseUSDT = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const { getContract } = useContract();

  const approveUSDT = async (amount: string, contract: Contract) => {
    const provider = contract.runner;
    if (!provider) throw new Error("Provider not found");

    const usdtContract = new Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      provider
    );

    const amountInWei = parseUnits(amount, 6);
    const currentAllowance = await usdtContract.allowance(account, contract.target);

    if (currentAllowance < amountInWei) {
      showToast("Approval Required", "Please approve USDT spending", "default");
      const approveTx = await usdtContract.approve(contract.target, amountInWei);
      await approveTx.wait();
      showToast("Success!", "USDT spending approved");
    }
  };

  const buyTokensWithUSDT = useCallback(async (amount: string) => {
    if (!window.ethereum || !account) {
      showToast("Not connected", "Please connect your wallet first", "destructive");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      const amountInWei = parseUnits(amount, 6);
      
      // First approve USDT spending
      await approveUSDT(amount, contract);
      
      // Then proceed with the purchase
      const tx = await contract.buyTokensWithUSDT(amountInWei);
      await tx.wait();

      showToast("Success!", "Tokens successfully purchased with USDT");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      showToast("Transaction Error", errorMessage, "destructive");
    } finally {
      setIsLoading(false);
    }
  }, [account, getContract]);

  return {
    isLoading,
    buyTokensWithUSDT
  };
};
