'use client';
import { useEffect, useState } from "react";

export function usePathname(pathname:string|undefined){
    const [path,setPath] = useState<string>(pathname && pathname !== undefined ? pathname : '');
    useEffect(()=>{
        console.log('path has changed from '+path+' to '+path);
        //setPath(location.pathname);
    },[path]) 
    //const {pathname,hostname,href,host,hash,origin,protocol,port} = location;

    return [path,setPath] as const;
}