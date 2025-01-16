import { Contract } from 'ethers';
import { useCallback } from 'react';
import { getProvider } from '@/utils/web3Utils';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/constants/contractConfig';

export const useContract = () => {
  const getContract = useCallback(async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, []);

  return { getContract };
};