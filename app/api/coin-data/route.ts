import { NextRequest, NextResponse } from "next/server";



export async function GET(req: NextRequest) {
  
  // Correct way: Await the searchParams Promise
  const query = req.nextUrl.searchParams;
  const total = query.get('total');
  
  // Now safely access the value
  //const total = sp?.total;

  console.log({ total });   // This will now work

  let apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false&price_change_percentage=24h';

  // If total parameter is provided (regardless of value), use the version without 24h change
  if (total) {
    apiUrl = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=false';
  }

  try {
    const res = await fetch(apiUrl, { 
      cache: 'no-store' 
    });

    if (!res.ok) {
      console.log(res.statusText);
      throw new Error(`API request failed with status ${res.status} && ${res.statusText}`);
    }

    const data = await res.json();

    return NextResponse.json({ 
      success: true,
      data: data || [] 
    });

  } catch (error) {
    console.error("CoinGecko API Error:", error);
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch cryptocurrency data",
      data: [] 
    });
  }
}