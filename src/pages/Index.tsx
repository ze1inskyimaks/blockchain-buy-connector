import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { connect, disconnect, account, isConnecting, buyToken, isLoading } = useWeb3();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-web3-accent mb-2">Web3 DApp</h1>
          <p className="text-gray-600">Connect your wallet and start interacting with the blockchain</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {!account ? (
            <Button
              className="w-full bg-web3-primary hover:bg-web3-accent text-white"
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
              
              <Button
                className="w-full bg-web3-primary hover:bg-web3-accent text-white"
                onClick={buyToken}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy Token"
                )}
              </Button>

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