import { useState, useCallback } from 'react';
import { Contract, parseEther, parseUnits } from 'ethers';
import { getProvider, showToast } from '@/utils/web3Utils';

const CONTRACT_ADDRESS = "0x19758F206CeE6a9D003CD5126Ff9672325561e27";
const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType":"address","name":"initialOwner","type":"address"},
      {"internalType":"address","name":"_tokenAddress","type":"address"},
      {"internalType":"address","name":"_usdtAddress","type":"address"},
      {"internalType":"uint256","name":"_tokenPriceUSDTinWei","type":"uint256"},
      {"internalType":"uint256","name":"_hardCap","type":"uint256"},
      {"internalType":"uint256","name":"_startTime","type":"uint256"},
      {"internalType":"uint256","name":"_endTime","type":"uint256"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{"internalType":"address","name":"owner","type":"address"}],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{"internalType":"address","name":"account","type":"address"}],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": false, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "tokensUnsold", "type": "uint256"}
    ],
    "name": "ICOEnded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "previousOwner", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "newOwner", "type": "address"}
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "buyer", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "paymentMethod", "type": "string"}
    ],
    "name": "TokensPurchased",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "GetAmountOfTokenForETH",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "value", "type": "uint256"}],
    "name": "GetAmountOfTokenForUSDT",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "TokenPriceInUSDT", "type": "uint256"}],
    "name": "GetTokenPriceInWeiForETH",
    "outputs": [{"internalType": "uint256", "name": "priceInWei", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "buyTokensWithETH",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "usdtAmount", "type": "uint256"}],
    "name": "buyTokensWithUSDT",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenPriceUSDTinWei",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endICO",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "endTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLatestPrice",
    "outputs": [{"internalType": "int256", "name": "", "type": "int256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "hardCap",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "token",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokensSold",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "newOwner", "type": "address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdt",
    "outputs": [{"internalType": "contract IERC20", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const getErrorMessage = (error: any): string => {
  console.error("Full blockchain error:", error);
  const errorString = error.toString();
  const match = errorString.match(/execution reverted: "([^"]+)"/);
  return match ? match[1] : "Unknown error occurred";
};

export const useTokenPurchase = (account: string | null) => {
  const [isLoading, setIsLoading] = useState(false);
  const [tokenPrice, setTokenPrice] = useState<string>('0');
  const [estimatedTokens, setEstimatedTokens] = useState<string>('0');
  const [estimatedPaymentAmount, setEstimatedPaymentAmount] = useState<string>('0');

  const getContract = useCallback(async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }, []);

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
      let paymentAmount;
      const tokenAmountWei = parseEther(tokenAmount);

      if (paymentMethod === 'eth') {
        paymentAmount = await contract.GetAmountOfETHForToken(tokenAmountWei);
        setEstimatedPaymentAmount((Number(paymentAmount) / 10**18).toString());
      } else {
        paymentAmount = await contract.GetAmountOfUSDTForToken(tokenAmountWei);
        setEstimatedPaymentAmount((Number(paymentAmount) / 10**6).toString());
      }
      setEstimatedTokens('');
    } catch (error) {
      console.error("Error calculating payment amount:", error);
      setEstimatedPaymentAmount('0');
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

  const buyTokensWithUSDT = useCallback(async (amount: string) => {
    if (!window.ethereum || !account) {
      showToast("Not connected", "Please connect your wallet first", "destructive");
      return;
    }

    try {
      setIsLoading(true);
      const contract = await getContract();
      const amountInWei = parseUnits(amount, 6);
      
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
