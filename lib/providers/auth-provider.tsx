'use client';

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const isChecked = useRef(false);

    useEffect(() => {
        const originalFetch = window.fetch;
        
        // Override fetch globally
        window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
          
            const finalInit: RequestInit = {
                ...init,
                credentials: 'include',         
            };

            let response = await originalFetch(input, finalInit);
            
            if (response.status === 401 && !pathname.startsWith('/auth') && !isChecked.current) {
                isChecked.current = true;
                try {
                    const refreshResponse = await originalFetch('/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include',
                    });

                    if (refreshResponse.ok) {
                        router.refresh();           
                        // Retry the original request as request don fail
                        response = await originalFetch(input, finalInit);
                    } else {
                        window.location.href = '/auth';
                    }
                } catch (error) {
                    console.error('Refresh failed:', error);
                    window.location.href = '/auth';
                }finally {
                    isChecked.current = false;
                }
            }

            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [router, pathname]);

    return <>{children}</>;
}