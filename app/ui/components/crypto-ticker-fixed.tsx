'use client';
import { useEffect, useState } from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export default function CryptoTickerFixed() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const fetchCoins = async () => {
    try {
      const res = await fetch(
        '/api/coin-data?total=12',
        //'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h',
        { cache: 'no-store' }
      );
      const data = (await res.json())['data'];
      if(data && data.length && data.length > 0)
      setCoins(data);
    } catch (error) {
      console.error('Failed to fetch ticker:', error);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // Update every 20 seconds
    return () => clearInterval(interval);
  }, []);

  // Duplicate for seamless infinite scroll
  const tickerCoins = [...coins, ...coins];

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-amber-400/30 py-3 overflow-hidden shadow-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`flex items-center gap-12 whitespace-nowrap ${isPaused ? '' : 'animate-ticker'}`}
        style={{ animationDuration: '45s' }}
      >
        {tickerCoins.map((coin, index) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div 
              key={`${coin.id}-${index}`} 
              className="flex items-center gap-8 text-sm font-medium"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={coin.image} 
                  alt={coin.name} 
                  className="w-6 h-6 rounded-full" 
                />
                <span className="text-white uppercase tracking-wider">{coin.symbol}</span>
              </div>

              <span className="font-mono text-white">
                ${coin.current_price.toLocaleString()}
              </span>

              <span className={`font-mono ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}