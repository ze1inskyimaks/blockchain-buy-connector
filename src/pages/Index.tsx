import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/Web3Context";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const { connect, disconnect, account, isConnecting, buyTokensWithETH, buyTokensWithUSDT, isLoading } = useWeb3();
  const [ethAmount, setEthAmount] = useState("");
  const [usdtAmount, setUsdtAmount] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Web3 DApp</h1>
          <p className="text-gray-600">Connect your wallet and purchase tokens</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {!account ? (
            <Button
              className="w-full"
              onClick={connect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Connected Account:</p>
                <p className="font-mono text-sm truncate">{account}</p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Buy with ETH</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Amount in ETH"
                    value={ethAmount}
                    onChange={(e) => setEthAmount(e.target.value)}
                  />
                  <Button
                    onClick={() => buyTokensWithETH(ethAmount)}
                    disabled={isLoading || !ethAmount}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buying...
                      </>
                    ) : (
                      "Buy with ETH"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Buy with USDT</p>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Amount in USDT"
                    value={usdtAmount}
                    onChange={(e) => setUsdtAmount(e.target.value)}
                  />
                  <Button
                    onClick={() => buyTokensWithUSDT(usdtAmount)}
                    disabled={isLoading || !usdtAmount}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Buying...
                      </>
                    ) : (
                      "Buy with USDT"
                    )}
                  </Button>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={disconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;