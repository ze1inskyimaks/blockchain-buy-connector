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
      const tokenAmountWei = parseEther(tokenAmount);
      let paymentAmount;

      if (paymentMethod === 'eth') {
        paymentAmount = await contract.GetAmountOfETHForToken(tokenAmountWei);
        const ethAmount = Number(paymentAmount) / 10**18;
        setEstimatedPaymentAmount(ethAmount.toString());
      } else {
        paymentAmount = await contract.GetAmountOfUSDTForToken(tokenAmountWei);
        const usdtAmount = Number(paymentAmount) / 10**6;
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