'use client';

export default function MultiCoinChart() {
  return (
    <div className="bg-zinc-950 border border-amber-400/30 rounded-3xl overflow-hidden">
  <div className="px-6 py-5 border-b border-amber-400/10 bg-black flex items-center gap-3">
    <div className="text-amber-400">
      <span className="text-xl">📈</span>
    </div>
    <div>
      <h3 className="text-white font-semibold text-lg">Live Market Snapshot</h3>
      <p className="text-amber-400/70 text-sm">Real-time cryptocurrency prices</p>
    </div>
  </div>

  <iframe
    src="https://s.tradingview.com/embed-widget/market-overview/?locale=en&theme=dark&symbols=BTC%2CETH%2CSOL%2CBNB%2CXRP%2CADA%2CAVAX%2CDOGE%2CSUI&hide_top_toolbar=true&hide_legend=false&show_popup_button=false&width=100%25&height=480"
    width="100%"
    height="720"
    frameBorder="0"
    //allowTransparency
    className="rounded-b-3xl"
  />
</div>
  );
}