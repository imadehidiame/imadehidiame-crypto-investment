import { useState, useEffect } from "react";
import { useFetch } from "./useFetch";

export function useCryptoPrices() {
    const search = new URLSearchParams({ price: '1' }).toString();
    
    const [cryptoPrice, setCryptoPrice] = useState<{ btc: number; eth: number }>({
        btc: 0,
        eth: 0
    });

    const { data, error, loading } = useFetch<{ btc: any; eth: any }>(
        `https://api.cryptapi.io/info/?${search}`,
        'GET'
    );

    useEffect(() => {
        if (!error && data) {
            const { btc, eth } = data;

            setCryptoPrice({
                btc: parseFloat(btc?.prices?.USD || '0'),
                eth: parseFloat(eth?.prices?.USD || '0')
            });
        }
    }, [data, error]);  

    return {
        prices: cryptoPrice,
        loading,
        error
    };
}