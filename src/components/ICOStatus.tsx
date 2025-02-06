import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useContract } from "@/hooks/useContract";
import { ExternalLink, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export const ICOStatus = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [soldTokens, setSoldTokens] = useState<number>(0);
  const [maxTokens, setMaxTokens] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { getContract } = useContract();

  useEffect(() => {
    const fetchICOData = async () => {
      try {
        const contract = await getContract();
        const startTimeUnix = await contract.startTime();
        const endTimeUnix = await contract.endTime();
        const totalSold = await contract.tokensSold();
        const maxICOTokens = await contract.hardCap();
        const tokenContractAddress = await contract.token();

        setStartTime(new Date(Number(startTimeUnix) * 1000));
        setEndTime(new Date(Number(endTimeUnix) * 1000));
        setSoldTokens(Number(totalSold) / 10**18);
        setMaxTokens(Number(maxICOTokens) / 10**18);
        setTokenAddress(tokenContractAddress);
        
        const soldPercentage = (Number(totalSold) / Number(maxICOTokens)) * 100;
        setProgress(Math.min(soldPercentage, 100));
      } catch (error) {
        console.error("Error fetching ICO data:", error);
      }
    };

    fetchICOData();
    const interval = setInterval(fetchICOData, 30000);

    return () => clearInterval(interval);
  }, [getContract]);

  useEffect(() => {
    const updateTimer = () => {
      if (!endTime) return;

      const now = new Date();
      const timeRemaining = endTime.getTime() - now.getTime();

      if (timeRemaining <= 0) {
        setTimeLeft("ICO Ended");
        return;
      }

      const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();

    return () => clearInterval(timer);
  }, [endTime]);

  const getICOStatus = () => {
    if (!startTime || !endTime) return "Loading...";
    
    const now = new Date();
    if (now < startTime) return "ICO Not Started";
    if (now > endTime) return "ICO Ended";
    return "ICO Active";
  };

  const handleTokenAddressClick = () => {
    window.open(`https://sepolia.etherscan.io/token/${tokenAddress}`, '_blank');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(tokenAddress);
      setCopied(true);
      toast({
        description: "Token address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy address",
      });
    }
  };

  return (
    <div className="space-y-6 bg-[#222222]/80 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-gray-800">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">ICO Status</h2>
        <p className="text-lg font-semibold text-indigo-400">{getICOStatus()}</p>
        <p className="text-xl font-bold text-purple-400 mt-2">{timeLeft}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>Progress</span>
          <span>{progress.toFixed(2)}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-gray-700" />
        <div className="flex justify-between text-sm text-gray-400">
          <span>{soldTokens.toLocaleString()} Tokens Sold</span>
          <span>{maxTokens.toLocaleString()} Max Tokens</span>
        </div>
      </div>

      {tokenAddress && (
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-indigo-400 hover:text-indigo-300 cursor-pointer" onClick={handleTokenAddressClick}>
            <span>Token Address: {tokenAddress.slice(0, 6)}...{tokenAddress.slice(-4)}</span>
            <ExternalLink size={16} />
          </div>
          <button
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-300 hover:text-white bg-[#2A2A2A] rounded-full shadow-sm hover:shadow transition-all duration-200"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Address'}</span>
          </button>
        </div>
      )}

      {startTime && endTime && (
        <div className="text-sm text-gray-400 space-y-1 text-center">
          <p>Start: {startTime.toLocaleString()}</p>
          <p>End: {endTime.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};