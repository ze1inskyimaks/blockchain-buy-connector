import { useState, useCallback } from 'react';
import { parseEther, parseUnits } from 'ethers';
import { useContract } from './useContract';
import { toast } from "@/components/ui/use-toast";

export const useTokenCalculations = () => {
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0');
  const [estimatedPaymentAmount, setEstimatedPaymentAmount] = useState<string>('0');
  const { getContract } = useContract();

  const calculateTokenAmount = useCallback(async (amount: string, paymentMethod: 'eth' | 'usdt') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setEstimatedTokens('0');
      return;
    }

    try {
      const contract = await getContract();
      let tokens;

      if (paymentMethod === 'eth') {
        const valueInWei = parseEther(amount);
        tokens = await contract.GetAmountOfTokenForETH(valueInWei);
      } else {
        const valueInWei = parseUnits(amount, 6); // USDT uses 6 decimals
        tokens = await contract.GetAmountOfTokenForUSDT(valueInWei);
      }

      const estimatedAmount = Number(tokens) / 10**18;
      setEstimatedTokens(estimatedAmount.toString());
      setEstimatedPaymentAmount('');
    } catch (error) {
      console.error("Error calculating token amount:", error);
      setEstimatedTokens('0');
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to calculate token amount. Please try a different amount."
      });
    }
  }, [getContract]);

  const calculatePaymentAmount = useCallback(async (tokenAmount: string, paymentMethod: 'eth' | 'usdt') => {
    if (!tokenAmount || isNaN(Number(tokenAmount)) || Number(tokenAmount) <= 0) {
      setEstimatedPaymentAmount('0');
      return;
    }

    try {
      const contract = await getContract();
      const tokenAmountWei = parseUnits(tokenAmount, 18);
      
      if (paymentMethod === 'eth') {
        const tokenPriceUSDT = await contract.tokenPriceUSDTinWei();
        const priceInETH = await contract.GetTokenPriceInWeiForETH(tokenPriceUSDT);
        const ethAmount = (Number(priceInETH) * Number(tokenAmount)) / 10**18;
        setEstimatedPaymentAmount(ethAmount.toString());
      } else {
        const tokenPriceUSDT = await contract.tokenPriceUSDTinWei();
        const usdtAmount = (Number(tokenPriceUSDT) * Number(tokenAmount)) / 10**6;
        setEstimatedPaymentAmount(usdtAmount.toString());
      }
      setEstimatedTokens('');
    } catch (error) {
      console.error("Error calculating payment amount:", error);
      setEstimatedPaymentAmount('0');
      toast({
        variant: "destructive",
        title: "Calculation Error",
        description: "Failed to calculate payment amount. Please try a different amount."
      });
    }
  }, [getContract]);

  return {
    estimatedTokens,
    estimatedPaymentAmount,
    calculateTokenAmount,
    calculatePaymentAmount,
  };
};