import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useContract } from "@/hooks/useContract";

export const ICOStatus = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [soldTokens, setSoldTokens] = useState<number>(0);
  const [maxTokens, setMaxTokens] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const { getContract } = useContract();

  useEffect(() => {
    const fetchICOData = async () => {
      try {
        const contract = await getContract();
        const startTimeUnix = await contract.startTime();
        const endTimeUnix = await contract.endTime();
        const totalSold = await contract.tokensSold();
        const maxICOTokens = await contract.hardCap();

        setStartTime(new Date(Number(startTimeUnix) * 1000));
        setEndTime(new Date(Number(endTimeUnix) * 1000));
        setSoldTokens(Number(totalSold) / 10**18);
        setMaxTokens(Number(maxICOTokens) / 10**18);
        
        const soldPercentage = (Number(totalSold) / Number(maxICOTokens)) * 100;
        setProgress(Math.min(soldPercentage, 100));
      } catch (error) {
        console.error("Error fetching ICO data:", error);
      }
    };

    fetchICOData();
    const interval = setInterval(fetchICOData, 30000); // Update every 30 seconds

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

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ICO Status</h2>
        <p className="text-lg font-semibold text-blue-600">{getICOStatus()}</p>
        <p className="text-xl font-bold text-purple-600 mt-2">{timeLeft}</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progress.toFixed(2)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>{soldTokens.toLocaleString()} Tokens Sold</span>
          <span>{maxTokens.toLocaleString()} Max Tokens</span>
        </div>
      </div>

      {startTime && endTime && (
        <div className="text-sm text-gray-600 space-y-1">
          <p>Start: {startTime.toLocaleString()}</p>
          <p>End: {endTime.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};