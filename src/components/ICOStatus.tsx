import React from "react";
import { Progress } from "@/components/ui/progress";

const ICOStatus = () => {
  const progress = 75; // Example progress value

  return (
    <div className="p-6 bg-black/40 rounded-xl shadow-lg border border-yellow-400/20">
      <h2 className="text-xl font-semibold text-white">ICO Status</h2>
      <Progress 
        value={progress} 
        className="h-2 bg-black/30 [&>div]:bg-yellow-400" 
      />
      <p className="text-gray-300 mt-2">Progress: {progress}%</p>
    </div>
  );
};

export default ICOStatus;