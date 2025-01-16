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
        tokens = await contract.getAmountOfTokenForETH(valueInWei);
      } else {
        const valueInWei = parseUnits(amount, 6);
        tokens = await contract.getAmountOfTokenForUSDT(valueInWei);
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
      let paymentAmount;
      const tokenAmountWei = parseEther(tokenAmount);

      if (paymentMethod === 'eth') {
        paymentAmount = await contract.getAmountOfETHForToken(tokenAmountWei);
        setEstimatedPaymentAmount((Number(paymentAmount) / 10**18).toString());
      } else {
        paymentAmount = await contract.getAmountOfUSDTForToken(tokenAmountWei);
        setEstimatedPaymentAmount((Number(paymentAmount) / 10**6).toString());
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