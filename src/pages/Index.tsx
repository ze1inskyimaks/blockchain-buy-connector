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
    <div className="min-h-screen bg-gradient-to-br from-web3-accent via-web3-primary to-web3-secondary p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">Web3 Token Sale</h1>
          <p className="text-lg text-indigo-200">Secure your tokens in our exclusive ICO</p>
          {tokenPrice && (
            <p className="text-xl font-semibold text-white mt-4 bg-web3-accent/20 inline-block px-6 py-2 rounded-full">
              Token Price: ${tokenPrice} USDT
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ICOStatus />

          <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-6 space-y-6 border border-white/20">
            {!account ? (
              <Button
                className="w-full bg-web3-accent hover:bg-web3-accent/90 text-white"
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
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-indigo-200">Connected Account:</p>
                  <p className="font-mono text-sm truncate text-white">{account}</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-indigo-200">Payment Amount ({paymentMethod.toUpperCase()})</Label>
                    <Input
                      id="amount"
                      type="text"
                      placeholder={`Enter amount in ${paymentMethod.toUpperCase()}`}
                      value={calculationMode === "payment" ? amount : estimatedPaymentAmount}
                      onChange={handleAmountChange}
                      className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-indigo-300/50"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tokenAmount" className="text-indigo-200">Token Amount</Label>
                    <Input
                      id="tokenAmount"
                      type="text"
                      placeholder="Enter token amount"
                      value={calculationMode === "token" ? tokenAmount : estimatedTokens}
                      onChange={handleTokenAmountChange}
                      className="mt-1 bg-white/5 border-white/20 text-white placeholder:text-indigo-300/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-indigo-200">Payment Method</Label>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={setPaymentMethod}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="eth" id="eth" className="border-indigo-400 text-indigo-400" />
                        <Label htmlFor="eth" className="text-indigo-200">ETH</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="usdt" id="usdt" className="border-indigo-400 text-indigo-400" />
                        <Label htmlFor="usdt" className="text-indigo-200">USDT</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    className="w-full bg-web3-accent hover:bg-web3-accent/90 text-white"
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
                  className="w-full border-white/20 text-indigo-200 hover:bg-white/10"
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