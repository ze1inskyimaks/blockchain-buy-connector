import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/Web3Context";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Index = () => {
  const { connect, disconnect, account, isConnecting, buyTokensWithETH, buyTokensWithUSDT, isLoading, tokenPrice } = useWeb3();
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eth");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and one decimal point
    // Prevent multiple decimal points and invalid characters
    if (value === '' || (/^\d*\.?\d*$/.test(value) && (value.match(/\./g) || []).length <= 1)) {
      // Don't allow starting with a decimal point
      if (value === '.' || value.startsWith('.')) {
        setAmount('0.');
      } else {
        setAmount(value);
      }
    }
  };

  const handlePurchase = () => {
    if (paymentMethod === "eth") {
      buyTokensWithETH(amount);
    } else {
      buyTokensWithUSDT(amount);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Web3 DApp</h1>
          <p className="text-gray-600">Connect your wallet and purchase tokens</p>
          {tokenPrice && (
            <p className="text-lg font-semibold text-green-600 mt-2">
              Token Price: ${tokenPrice} USDT
            </p>
          )}
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
            <div className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Connected Account:</p>
                <p className="font-mono text-sm truncate">{account}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={handleAmountChange}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="eth" id="eth" />
                      <Label htmlFor="eth">ETH</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="usdt" id="usdt" />
                      <Label htmlFor="usdt">USDT</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={isLoading || !amount}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Buy with ${paymentMethod.toUpperCase()}`
                  )}
                </Button>
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