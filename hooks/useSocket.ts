import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";



export function useSocket(query?:Record<string,string>,emitHandler?:{
    event:string,
    handler:(data:{flag:string,data:unknown}|any)=>void
}[]){
    const getUrl = () : string =>{
            const is_secure = location.protocol === 'https:';
            const localhost = 'localhost:3001';
            const ws_server = 'chat';
            const ws = is_secure ? `https://${ws_server}.cinvdesk.com` : `http://${localhost}`;
            const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ws;
            return socketUrl;
    }
    const [newSocket,setNewSocket] = useState<Socket>();
            useEffect(()=>{
                const socket = io(getUrl(),{
                    query,
                    //query,
                    // Recommended options for production
                    reconnection: true,
                    reconnectionAttempts: 5,
                    timeout: 10000,
                  });
                  setNewSocket(socket);
                    emitHandler?.forEach(element => {
                        socket.on(element.event,element.handler);
                 });
                return ()=>{
                    socket.disconnect();
                }
            },[]);
        return newSocket;
}