'use client';
import { useEffect, useState } from 'react';

interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap_rank: number;
}

export default function MulticoinLiveDashboard() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoins = async () => {
    try {
      /*const res1 = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h',
        { cache: 'no-store', headers:{
            'Access-Control-Allow-Origin':'*'
        } }
      );*/

      const res = await fetch(
        '/api/coin-data',
        { cache: 'no-store' }
      );

      if (!res.ok) throw new Error('Failed to fetch');

      const data: Coin[] = (await res.json())['data'];
      console.log(data);
      if(data && data.length && data.length > 0)
      setCoins(data);
    } catch (error) {
      console.error('Error fetching crypto data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // Update every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-amber-400/30 rounded-3xl p-8 h-96 flex items-center justify-center">
        <div className="text-amber-400">Loading market data...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 border border-amber-400/30 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-amber-400/10 bg-black flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📈</span>
          <h3 className="text-white font-semibold text-xl">Live Crypto Market</h3>
        </div>
        <div className="text-xs text-amber-400/70">Updates every 15s</div>
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-gray-800">
        {coins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div key={coin.id} className="bg-zinc-900 p-5 hover:bg-zinc-800 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={coin.image} 
                  alt={coin.name} 
                  className="w-9 h-9" 
                />
                <div>
                  <div className="font-semibold text-white">{coin.name}</div>
                  <div className="text-gray-400 text-sm uppercase">{coin.symbol}</div>
                </div>
              </div>

              <div className="text-2xl font-bold text-white mb-1">
                ${coin.current_price.toLocaleString()}
              </div>

              <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}% (24h)
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}