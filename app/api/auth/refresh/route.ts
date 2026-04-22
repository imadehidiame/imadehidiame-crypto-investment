import { connectToDatabase } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import User from "@/models/User";
import { REFRESH_REDIS_PREFIX, UserPayload } from "@/types";
import { jwtVerify, SignJWT } from "jose";
//import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const REFRESH_TOKEN_PREFIX = 'refresh:'
const JWT_SECRET_REFRESH = process.env.ADM_SESSION_SECRET!;
const JWT_SECRET = process.env.SESSION_SECRET!;

const secret = new TextEncoder().encode(JWT_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_SECRET_REFRESH);

interface RedisPayload extends UserPayload {
    timestamp:Date|string
}

export async function POST(request:NextRequest){
    try {

    const oldRefreshToken = request.cookies.get('refresh_token')?.value;
    if(!oldRefreshToken){
        return NextResponse.json({error:'No refresh token'},{status:401});
    }
    const cachedSession = await redis.get(`${REFRESH_TOKEN_PREFIX}${oldRefreshToken}`);
    if(cachedSession){
        const user = JSON.parse(cachedSession) as RedisPayload;
        const newAccessToken = await new SignJWT({
            email:user.email,
            name:user.name,
            role:user.role,
            stage:user.stage,
            userId:user.userId
        }).setIssuedAt()
        .setExpirationTime('7d')
        .setProtectedHeader({alg:'HS256'})
        .sign(secret);


        
        /*jwt.sign({
                email:user.email,
                name:user.name,
                role:user.role,
                stage:user.stage,
                userId:user.userId
            } as UserPayload,JWT_SECRET,{
                expiresIn:'1h'
            });*/
            const response = NextResponse.json({logged:true});
        /*const shouldRotateToken = !user.timestamp || ((Date.now() - new Date(user.timestamp).getTime()) >= (60*60*24*1000));
        if(shouldRotateToken){
            console.log('We are updating redis most definitely');
            const refreshToken = await (new SignJWT({
                email:user.email,
                name:user.name,
                role:user.role,
                stage:user.stage,
                userId:user.userId,
                //timestamp:new Date()
            }).setExpirationTime('14d').setIssuedAt().setProtectedHeader({alg:'HS256'}).sign(refreshSecret));
            await redis.set(`${REFRESH_REDIS_PREFIX}${refreshToken}`,JSON.stringify({
                email:user.email,
                name:user.name,
                role:user.role,
                stage:user.stage,
                userId:user.userId,
                timestamp:new Date()
            }),'EX',)
        }*/
            response.cookies.set('access_token',newAccessToken,{
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 60 * 10,
                path: '/'
            });
        //}
        return response;
    }
    await connectToDatabase();
    console.log('Refresh route in action');
    const userSession = (await jwtVerify(oldRefreshToken,refreshSecret)).payload as any as UserPayload;
    //as {payload: any}; 
    /*jwt.verify(oldRefreshToken,JWT_SECRET_REFRESH)*/ 
    const userId = new Types.ObjectId(userSession.userId);
    const user = await User.findById({userId});
    if(!user || user.refreshToken !== oldRefreshToken){
        return NextResponse.json({error:'Invalid refresh token'},{status:401});
    }
    const newAccessToken = await new SignJWT({
        email:user.email,
        name:user.name,
        role:user.role,
        stage:user.stage,
        userId:user.userId
    }).setIssuedAt()
    .setExpirationTime('7d')
    .setProtectedHeader({alg:'HS256'})
    .sign(secret);
    
    /*jwt.sign({
        email:user.email,
        name:user.name,
        role:user.role,
        stage:user.stage,
        userId:user.userId
    } as UserPayload,JWT_SECRET,{
        expiresIn:'1h'
    });*/
    let newRefreshToken = oldRefreshToken;
    const shouldRotateToken = !user.refreshTokenTimestamp || (Date.now() - new Date(user.refreshTokenTimestamp as string|Date).getTime()) >= (60*60*24*1000);
    if(shouldRotateToken){
        //create new refresh token for database and redis
        newRefreshToken = await new SignJWT({
            email:user.email,
            name:user.name,
            role:user.role,
            stage:user.stage,
            userId:user.userId
        }).setIssuedAt()
        .setExpirationTime('14d')
        .setProtectedHeader({alg:'HS256'})
        .sign(refreshSecret);
        
        /*jwt.sign({
            email:user.email,
            name:user.name,
            role:user.role,
            stage:user.stage,
            userId:user.userId
        },JWT_SECRET_REFRESH,{
            expiresIn:'7d'
        });*/
        user.refreshToken = newRefreshToken;
        user.refreshTokenTimestamp = new Date();
        await user.save();
        await redis.set(`${REFRESH_TOKEN_PREFIX}${newRefreshToken}`,
            JSON.stringify({
                email:user.email,
                name:user.name,
                role:user.role,
                stage:user.stage,
                userId:user._id.toString()
            }),
            'EX',
            60*60*24
        );
    }
    const response = NextResponse.json({logged:true});
    response.cookies.set('access_token',newAccessToken,{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    });
    if(shouldRotateToken)
    response.cookies.set('refresh_token',newRefreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 14,
            path: '/'
    });
    return response;            
        
    } catch (error) {
        const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
        response.cookies.delete('refresh_token');
        response.cookies.delete('access_token');
        return response;
    }
    
}