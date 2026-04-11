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

export default function CryptoTicker() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await fetch(
            '/api/coin-data?total=156',
        //https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h
          //'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false',
          { cache: 'no-store' }
        );
        const data = (await res.json())['data'];
        setCoins(data);
      } catch (error) {
        console.error('Failed to fetch ticker data:', error);
      }
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Duplicate the coins array to create seamless infinite scroll
  const tickerCoins = [...coins, ...coins];

  return (
    <div 
      className="bg-zinc-950 border-t border-amber-400/20 py-3 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className={`flex items-center gap-12 whitespace-nowrap ${isPaused ? 'animate-none' : 'animate-ticker'}`}
      >
        {tickerCoins.map((coin, index) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div key={`${coin.id}-${index}`} className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-3 min-w-[180px]">
                <img 
                  src={coin.image} 
                  alt={coin.name} 
                  className="w-6 h-6" 
                />
                <div>
                  <span className="font-medium text-white">{coin.symbol.toUpperCase()}</span>
                  <span className="text-gray-400 ml-2">{coin.name}</span>
                </div>
              </div>

              <div className="font-mono text-white">
                ${coin.current_price.toLocaleString()}
              </div>

              <div className={`font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}