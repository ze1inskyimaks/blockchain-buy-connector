
import { useState, useCallback } from 'react';
import { useContract } from './useContract';

export const useTokenPrice = () => {
  const [tokenPrice, setTokenPrice] = useState<string>('0');
  const { getContract } = useContract();

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

  return {
    tokenPrice,
    fetchTokenPrice
  };
};
