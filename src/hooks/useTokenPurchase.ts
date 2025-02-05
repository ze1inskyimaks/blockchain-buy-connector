import { useState, useCallback } from 'react';
import { parseEther, parseUnits, Contract } from 'ethers';
import { showToast } from '@/utils/web3Utils';
import { useContract } from './useContract';
import { useTokenCalculations } from './useTokenCalculations';
import { getErrorMessage } from '@/utils/errorUtils';
import { USDT_CONTRACT_ADDRESS, USDT_ABI } from '@/constants/contractConfig';

export const useTokenPurchase = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<string>('0');
  const { getContract } = useContract();
  const { 
    estimatedTokens, 
    estimatedPaymentAmount, 
    calculateTokenAmount, 
    calculatePaymentAmount 
  } = useTokenCalculations();

  const fetchTokenPrice = useCallback(async () => {
    try {
      const contract = await getContract();
      const priceInWei = await contract.tokenPriceUSDTinWei();
      const priceInUSDT = Number(priceInWei) / 10**6;
      setTokenPrice(priceInUSDT.toString());
    } catch (error) {
      console.error("Error fetching token price:", error);
    }
  }, [getContract]);

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

  const approveUSDT = async (amount: string, contract: Contract) => {
    const usdtContract = new Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      await contract.runner.provider.getSigner()
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
    tokenPrice,
    estimatedTokens,
    estimatedPaymentAmount,
    buyTokensWithETH,
    buyTokensWithUSDT,
    calculateTokenAmount,
    calculatePaymentAmount,
    fetchTokenPrice
  };
};