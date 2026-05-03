import { getCurrentUser } from "@/lib/auth";
import { redis } from "@/lib/redis";
import User from "@/models/User";
import { REFRESH_REDIS_PREFIX } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request:NextRequest){
    const userSession = await getCurrentUser();
    const response = NextResponse.redirect(new URL('/auth',request.url));
    if(userSession){
        //delete redis storage
        const refreshToken = request.cookies.get('refresh_token')?.value;
        await redis.del([`${REFRESH_REDIS_PREFIX}${refreshToken}`]);
        const user = await User.findByIdAndUpdate(userSession.userId,{
            refreshToken:null,
            refreshTokenTimestamp:null
        });
        //console.log({user});
        response.cookies.delete('access_token');
        response.cookies.delete('refresh_token');
        return response;
    }
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;    
}