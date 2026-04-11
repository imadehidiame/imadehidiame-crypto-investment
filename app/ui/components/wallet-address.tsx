'use client';
import { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetch_request_mod, NumberFormat } from '@/lib/utils';
import { useCryptoPrices } from '@/hooks/useCryptoPrices';

interface WalletAddressesProps {
  btcAddress: string;
  ethAddress: string;
  amount: number;
  //minBtcAmount?: string|number;
  //minEthAmount?: string|number;
  //formatNumber?:boolean
}

export default function WalletAddresses({
  btcAddress,
  ethAddress,
  amount
  //minBtcAmount = "0.001",
  //minEthAmount = "0.01",
  //formatNumber = false
}: WalletAddressesProps) {

  const {prices} = useCryptoPrices();

  const formatBtcAmount = NumberFormat.thousands(amount/prices.btc,{allow_decimal:true,length_after_decimal:15,add_if_empty:false,allow_zero_start:true});

  const formatEthAmount = NumberFormat.thousands(amount/prices.eth,{allow_decimal:true,length_after_decimal:15,add_if_empty:false,allow_zero_start:true});

  const [copied, setCopied] = useState<'btc' | 'eth' | null>(null);

  const copyToClipboard = async (address: string, type: 'btc' | 'eth') => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(type);
      
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Deposit Addresses</h2>
        <p className="text-gray-400 text-sm leading-relaxed px-2">
          Send exactly <span className="text-amber-400 font-medium">
            ${amount.toLocaleString()}
          </span> worth of crypto to any of the addresses below
        </p>
      </div>

      {/* Bitcoin Card */}
      <div className="bg-zinc-900 border border-amber-400/30 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
              ₿
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Bitcoin (BTC)</p>
              <p className="text-amber-400 text-sm">≈ {formatBtcAmount} BTC</p>
            </div>
          </div>

          <Button
            onClick={() => copyToClipboard(btcAddress, 'btc')}
            variant="outline"
            className="border-amber-400/50 hover:bg-amber-400 hover:text-black text-amber-400 w-full sm:w-auto"
          >
            {copied === 'btc' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy BTC Address
              </>
            )}
          </Button>
        </div>

        <div className="bg-black p-4 rounded-xl font-mono text-xs sm:text-sm text-gray-300 break-all leading-relaxed border border-gray-800">
          {btcAddress}
        </div>
      </div>

      {/* Ethereum Card */}
      <div className="bg-zinc-900 border border-amber-400/30 rounded-2xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl flex-shrink-0">
              Ξ
            </div>
            <div>
              <p className="font-semibold text-white text-lg">Ethereum (ETH)</p>
              <p className="text-amber-400 text-sm">≈ {formatEthAmount} ETH</p>
            </div>
          </div>

          <Button
            onClick={() => copyToClipboard(ethAddress, 'eth')}
            variant="outline"
            className="border-amber-400/50 hover:bg-amber-400 hover:text-black text-amber-400 w-full sm:w-auto"
          >
            {copied === 'eth' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy ETH Address
              </>
            )}
          </Button>
        </div>

        <div className="bg-black p-4 rounded-xl font-mono text-xs sm:text-sm text-gray-300 break-all leading-relaxed border border-gray-800">
          {ethAddress}
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 px-2">
        Only send supported cryptocurrencies to these addresses.<br className="sm:hidden" />
        Sending other assets may result in permanent loss.
      </p>
    </div>
  );
}