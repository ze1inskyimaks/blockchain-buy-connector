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
    <div className="min-h-screen bg-black bg-[url('/coin-bg.png')] bg-no-repeat bg-center bg-fixed bg-opacity-50 flex items-start justify-start p-8">
      <div className="max-w-4xl w-full space-y-8 ml-12">
        <div className="text-left">
          <h1 className="text-4xl font-bold text-yellow-500 mb-2">Web3 DApp</h1>
          <p className="text-yellow-400">Connect your wallet and purchase tokens</p>
          {tokenPrice && (
            <p className="text-lg font-semibold text-yellow-500 mt-2">
              Token Price: ${tokenPrice} USDT
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ICOStatus />

          <div className="bg-black/80 backdrop-blur-sm rounded-xl shadow-lg p-6 space-y-6 border border-yellow-500">
            {!account ? (
              <Button
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
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
                <div className="p-4 bg-yellow-900/50 rounded-lg">
                  <p className="text-sm text-yellow-400">Connected Account:</p>
                  <p className="font-mono text-sm truncate text-yellow-500">{account}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-yellow-400">Payment Amount ({paymentMethod.toUpperCase()})</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder={`Enter amount in ${paymentMethod.toUpperCase()}`}
                      value={calculationMode === "payment" ? amount : estimatedPaymentAmount}
                      onChange={handleAmountChange}
                      className="mt-1 bg-black/50 border-yellow-500 text-yellow-400 placeholder:text-yellow-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenAmount" className="text-yellow-400">Token Amount</Label>
                    <Input
                      id="tokenAmount"
                      type="text"
                      placeholder="Enter token amount"
                      value={calculationMode === "token" ? tokenAmount : estimatedTokens}
                      onChange={handleTokenAmountChange}
                      className="mt-1 bg-black/50 border-yellow-500 text-yellow-400 placeholder:text-yellow-900"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-yellow-400">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eth" id="eth" className="border-yellow-500 text-yellow-500" />
                        <Label htmlFor="eth" className="text-yellow-400">ETH</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="usdt" id="usdt" className="border-yellow-500 text-yellow-500" />
                        <Label htmlFor="usdt" className="text-yellow-400">USDT</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
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
                  className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-900/20"
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