import { fetch_request_mod } from "@/lib/utils";
import { useEffect, useState } from "react";

export function useFetch<T>(url:string,method:'GET'|'POST'|'PATCH'|'PUT'|'DELETE'){
    const [loading,setLoading] = useState<boolean>(true);
    const [data,setData] = useState<T>();
    const [error,setError] = useState<Error|null>(null);
    useEffect(()=>{
        const asyncRequest = async () => {
            try {
                setLoading(true);
                const { data, served, status, is_error } = await fetch_request_mod<T>(
                    method,
                    url
                );
                if(is_error)
                    throw new Error(data)
                setData(served);
            /**
             return { is_error:true,data:statusText,status };  
            return {is_error:true,status,data:'Unspecified error'}; 
              */    
            } catch (error) {
                console.log('An error occured');
                setError(error as Error);
            }finally{
                setLoading(false);
            }
            
        }
        asyncRequest();
    },[url])
    return {data,loading,error};
}
