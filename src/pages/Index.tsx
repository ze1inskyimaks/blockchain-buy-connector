import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/contexts/Web3Context";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ICOStatus } from "@/components/ICOStatus";

const Index = () => {
  const { connect, disconnect, account, isConnecting, buyTokensWithETH, buyTokensWithUSDT, isLoading, tokenPrice, estimatedTokens, estimatedPaymentAmount, calculateTokenAmount, calculatePaymentAmount } = useWeb3();
  const [amount, setAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("eth");
  const [calculationMode, setCalculationMode] = useState<"payment" | "token">("payment");

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && (value.match(/\./g) || []).length <= 1)) {
      if (value === '.' || value.startsWith('.')) {
        setAmount('0.');
      } else {
        setAmount(value);
      }
      setCalculationMode("payment");
      calculateTokenAmount(value || '0', paymentMethod as 'eth' | 'usdt');
      setTokenAmount('');
    }
  };

  const handleTokenAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && (value.match(/\./g) || []).length <= 1)) {
      if (value === '.' || value.startsWith('.')) {
        setTokenAmount('0.');
      } else {
        setTokenAmount(value);
      }
      setCalculationMode("token");
      calculatePaymentAmount(value || '0', paymentMethod as 'eth' | 'usdt');
      setAmount('');
    }
  };

  useEffect(() => {
    if (calculationMode === "payment" && amount) {
      calculateTokenAmount(amount, paymentMethod as 'eth' | 'usdt');
    } else if (calculationMode === "token" && tokenAmount) {
      calculatePaymentAmount(tokenAmount, paymentMethod as 'eth' | 'usdt');
    }
  }, [paymentMethod, amount, tokenAmount, calculationMode, calculateTokenAmount, calculatePaymentAmount]);

  const handlePurchase = () => {
    const purchaseAmount = calculationMode === "payment" ? amount : estimatedPaymentAmount;
    if (paymentMethod === "eth") {
      buyTokensWithETH(purchaseAmount);
    } else {
      buyTokensWithUSDT(purchaseAmount);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A1F2C] text-gray-100 flex items-start justify-start p-8">
      <div className="max-w-4xl w-full space-y-8 mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Web3 Token Sale</h1>
          <p className="text-gray-400">Connect your wallet to participate in the token sale</p>
          {tokenPrice && (
            <p className="text-lg font-semibold text-indigo-400 mt-2">
              Token Price: ${tokenPrice} USDT
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ICOStatus />

          <div className="bg-[#222222]/80 backdrop-blur-lg rounded-xl shadow-xl border border-gray-800 p-6 space-y-6">
            {!account ? (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
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
                <div className="p-4 bg-[#2A2A2A] rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-400">Connected Account:</p>
                  <p className="font-mono text-sm text-indigo-400 truncate">{account}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-gray-300">Payment Amount ({paymentMethod.toUpperCase()})</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder={`Enter amount in ${paymentMethod.toUpperCase()}`}
                      value={calculationMode === "payment" ? amount : estimatedPaymentAmount}
                      onChange={handleAmountChange}
                      className="mt-1 bg-[#2A2A2A] border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenAmount" className="text-gray-300">Token Amount</Label>
                    <Input
                      id="tokenAmount"
                      type="text"
                      placeholder="Enter token amount"
                      value={calculationMode === "token" ? tokenAmount : estimatedTokens}
                      onChange={handleTokenAmountChange}
                      className="mt-1 bg-[#2A2A2A] border-gray-700 text-white placeholder:text-gray-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-300">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eth" id="eth" />
                        <Label htmlFor="eth" className="text-gray-300">ETH</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="usdt" id="usdt" />
                        <Label htmlFor="usdt" className="text-gray-300">USDT</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handlePurchase}
                    disabled={isLoading || (!amount && !tokenAmount)}
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
                  className="w-full border-gray-700 hover:bg-gray-800 text-gray-300"
                  onClick={disconnect}
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;