import { useState, useCallback } from 'react';
import { Contract, parseEther, parseUnits } from 'ethers';
import { getProvider, showToast } from '@/utils/web3Utils';

const CONTRACT_ADDRESS = "0x145582396f98A8A99A03F863F66111D939F048B2";
const CONTRACT_ABI = [{"inputs":[{"internalType":"address","name":"initialOwner","type":"address"},{"internalType":"address","name":"_tokenAddress","type":"address"},{"internalType":"address","name":"_usdtAddress","type":"address"},{"internalType":"uint256","name":"_tokenPriceUSDTinWei","type":"uint256"},{"internalType":"uint256","name":"_hardCap","type":"uint256"},{"internalType":"uint256","name":"_startTime","type":"uint256"},{"internalType":"uint256","name":"_endTime","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"OwnableInvalidOwner","type":"error"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"OwnableUnauthorizedAccount","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokensUnsold","type":"uint256"}],"name":"ICOEnded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"buyer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"string","name":"paymentMethod","type":"string"}],"name":"TokensPurchased","type":"event"},{"inputs":[{"internalType":"uint256","name":"TokenPriceInUSDT","type":"uint256"}],"name":"GetTokenPriceInWeiForETH","outputs":[{"internalType":"uint256","name":"priceInWei","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"buyTokensWithETH","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"usdtAmount","type":"uint256"}],"name":"buyTokensWithUSDT","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const getErrorMessage = (error: any): string => {
  console.error("Buy error:", error);
  
  // Перевіряємо наявність повідомлення про помилку в різних форматах
  const reason = error.reason || 
                 (error.error && error.error.message) || 
                 (error.data && error.data.message);

  if (reason) {
    if (reason.includes("Not enough tokens available")) {
      return "Недостатньо токенів доступно для продажу";
    }
    if (reason.includes("ICO not started")) {
      return "ICO ще не розпочалось";
    }
    if (reason.includes("ICO ended")) {
      return "ICO вже закінчилось";
    }
    if (reason.includes("Amount too low")) {
      return "Сума занадто мала";
    }
    if (reason.includes("Hard cap reached")) {
      return "Досягнуто максимальний ліміт продажу";
    }
    if (reason.includes("insufficient funds")) {
      return "Недостатньо коштів на балансі";
    }
  }

  return "Помилка транзакції. Будь ласка, спробуйте ще раз";
};

export const useTokenPurchase = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);

  const getContract = useCallback(async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, []);

  const buyTokensWithETH = useCallback(async (amount: string) => {
    if (!window.ethereum || !account) {
      showToast("Не підключено", "Будь ласка, підключіть гаманець спочатку", "destructive");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      const valueInWei = parseEther(amount);
      
      const tx = await contract.buyTokensWithETH({ value: valueInWei });
      await tx.wait();

      showToast("Успіх!", "Токени успішно придбано за ETH");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      showToast("Помилка транзакції", errorMessage, "destructive");
    } finally {
      setIsLoading(false);
    }
  }, [account, getContract]);

  const buyTokensWithUSDT = useCallback(async (amount: string) => {
    if (!window.ethereum || !account) {
      showToast("Не підключено", "Будь ласка, підключіть гаманець спочатку", "destructive");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      const amountInWei = parseUnits(amount, 6);
      
      const tx = await contract.buyTokensWithUSDT(amountInWei);
      await tx.wait();

      showToast("Успіх!", "Токени успішно придбано за USDT");
    } catch (error: any) {
      const errorMessage = getErrorMessage(error);
      showToast("Помилка транзакції", errorMessage, "destructive");
    } finally {
      setIsLoading(false);
    }
  }, [account, getContract]);

  return {
    isLoading,
    buyTokensWithETH,
    buyTokensWithUSDT
  };
};