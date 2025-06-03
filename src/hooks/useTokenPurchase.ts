
import { useTokenPrice } from './useTokenPrice';
import { useTokenPurchaseETH } from './useTokenPurchaseETH';
import { useTokenPurchaseUSDT } from './useTokenPurchaseUSDT';
import { useTokenCalculations } from './useTokenCalculations';

export const useTokenPurchase = (account: string | null) => {
  const { tokenPrice, fetchTokenPrice } = useTokenPrice();
  const { isLoading: isLoadingETH, buyTokensWithETH } = useTokenPurchaseETH(account);
  const { isLoading: isLoadingUSDT, buyTokensWithUSDT } = useTokenPurchaseUSDT(account);
  const { 
    estimatedTokens, 
    estimatedPaymentAmount, 
    calculateTokenAmount, 
    calculatePaymentAmount 
  } = useTokenCalculations();

  const isLoading = isLoadingETH || isLoadingUSDT;

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
