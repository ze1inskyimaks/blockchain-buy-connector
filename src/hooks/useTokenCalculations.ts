import { useState, useCallback } from 'react';
import { parseEther, parseUnits } from 'ethers';
import { useContract } from './useContract';

export const useTokenCalculations = () => {
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0');
  const [estimatedPaymentAmount, setEstimatedPaymentAmount] = useState<string>('0');
  const { getContract } = useContract();

  const calculateTokenAmount = useCallback(async (amount: string, paymentMethod: 'eth' | 'usdt') => {
    if (!amount || isNaN(Number(amount))) {
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
        const valueInWei = parseUnits(amount, 6);
        tokens = await contract.GetAmountOfTokenForUSDT(valueInWei);
      }

      const estimatedAmount = Number(tokens) / 10**18;
      setEstimatedTokens(estimatedAmount.toString());
      setEstimatedPaymentAmount('');
    } catch (error) {
      console.error("Error calculating token amount:", error);
      setEstimatedTokens('0');
    }
  }, [getContract]);

  const calculatePaymentAmount = useCallback(async (tokenAmount: string, paymentMethod: 'eth' | 'usdt') => {
    if (!tokenAmount || isNaN(Number(tokenAmount))) {
      setEstimatedPaymentAmount('0');
      return;
    }

    try {
      const contract = await getContract();
      const tokenAmountWei = parseUnits(tokenAmount, 18);
      let paymentAmount;

      if (paymentMethod === 'eth') {
        // Get token price in USDT first
        const tokenPriceUSDT = await contract.tokenPriceUSDTinWei();
        // Convert USDT price to ETH
        paymentAmount = await contract.GetTokenPriceInWeiForETH(tokenPriceUSDT);
        // Calculate final amount
        const ethAmount = (Number(paymentAmount) * Number(tokenAmount)) / 10**18;
        setEstimatedPaymentAmount(ethAmount.toString());
      } else {
        // For USDT, we can use the direct token price
        const tokenPriceUSDT = await contract.tokenPriceUSDTinWei();
        const usdtAmount = (Number(tokenPriceUSDT) * Number(tokenAmount)) / 10**6;
        setEstimatedPaymentAmount(usdtAmount.toString());
      }
      setEstimatedTokens('');
    } catch (error) {
      console.error("Error calculating payment amount:", error);
      setEstimatedPaymentAmount('0');
    }
  }, [getContract]);

  return {
    estimatedTokens,
    estimatedPaymentAmount,
    calculateTokenAmount,
    calculatePaymentAmount,
  };
};