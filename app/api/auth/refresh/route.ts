import { connectToDatabase } from "@/lib/mongodb";
import { redis } from "@/lib/redis";
import User from "@/models/User";
import { REFRESH_REDIS_PREFIX, UserPayload } from "@/types";
import { m } from "framer-motion";
import { jwtVerify, SignJWT } from "jose";
import { JOSEError,JWTExpired,JWTInvalid } from "jose/errors";
import { JsonWebTokenError } from "jsonwebtoken";
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

const comparePayloads = (client:UserPayload,server:UserPayload):boolean =>  {
    const checks = ['userId','email','role','name'];
    /*type m = typeof client;
    type t = keyof m;
    let b:t = 'stage'*/
    let check = true;
    for (let index = 0; index < checks.length; index++) {
        const element = checks[index];
        check = check && (client[element as keyof typeof client] === server[element as keyof typeof server]);
        if(!check)
            break;
    }
    return check;
}

export async function POST(request:NextRequest){
    try {
    const search = request.nextUrl.searchParams.get('middle') === 'check';
    const oldRefreshToken = request.cookies.get('refresh_token')?.value;
    if(!oldRefreshToken){
        return NextResponse.json({error:'No refresh token'},{status:401});
    }
    if(search){
        //let checkOldRefreshToken = request.headers.get('X-REF-ID');
        //console.log({checkOldRefreshToken});
        //console.log({oldRefreshToken});
        //console.log(oldRefreshToken === checkOldRefreshToken);
        try {
        const userPayload = (await jwtVerify(oldRefreshToken,refreshSecret)).payload as unknown as UserPayload;
        //console.log({userPayload});
        await connectToDatabase();
        const user = await User.findById( typeof userPayload.userId === 'string' ? new Types.ObjectId(userPayload.userId as string): userPayload.userId);
        //console.log({user});
        let isValidUser = !!user;
        const allowedEmails = ['imadehidiame@gmail.com','freetone4life@gmail.com','ehimadegbor@gmail.com'];
        //console.log({isValidUser});
        if(isValidUser){
            if(!allowedEmails.includes(user.email)){
                //console.log('It does not include email');
                isValidUser = isValidUser && (user.refreshToken === oldRefreshToken);
            }else{
                //console.log('It does include email');
                const servedSession = (await jwtVerify(user.refreshToken,refreshSecret)).payload as unknown as UserPayload;
                //console.log({servedSession});
                isValidUser = isValidUser && comparePayloads(userPayload,servedSession);
            }
        }
        //console.log('User after first check');
        //console.log({isValidUser});
        if(!isValidUser){
            return NextResponse.json({error:'Invalid response token'},
                {status:401,statusText:'Invalid refresh token'});
        }
        //let shouldRotateToken = true;
        //if(user.refreshTokenTimestamp)
        //if refresh token is more than a day old
        const shouldRotateToken = !user.refreshTokenTimestamp || (Date.now() - new Date(user.refreshTokenTimestamp as string|Date).getTime()) >= (60*60*24*1000);
        let newRefreshToken = oldRefreshToken;
        const newAccessToken = await new SignJWT({
            email:user.email,
            name:user.name,
            role:user.role,
            stage:user.stage,
            userId:user._id.toString()
        }).setIssuedAt().setExpirationTime('7d').setProtectedHeader({alg:'HS256'}).sign(secret);
        if(shouldRotateToken){
            newRefreshToken = await new SignJWT({
                email:user.email,
                name:user.name,
                role:user.role,
                stage:user.stage,
                userId:user._id.toString()
            }).setIssuedAt().setExpirationTime('14d').setProtectedHeader({alg:'HS256'}).sign(refreshSecret);
            user.refreshToken = newRefreshToken;
            user.refreshTokenTimestamp = new Date();
            await user.save();
        }
        const response = NextResponse.json({access:newAccessToken,refresh: shouldRotateToken ? newRefreshToken: '',message:'success'});
        response.cookies.set('access_token',newAccessToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });
        response.cookies.set('refresh_token',newRefreshToken,{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 14,
            path: '/'
        });
        return response;
        } catch (error) {
            console.log(error);
            if(error instanceof Error){
                if(error instanceof JWTInvalid){
                    console.log('Invalid JWT string');
                    return NextResponse.json({error:'Invalid JWT string'},
                        {status:401,statusText:'Invalid JWT string'});
                }else if(error instanceof JWTExpired){
                    console.log('Expired JWT string');
                    return NextResponse.json({error:'Expired JWT string'},
                        {status:401,statusText:'Expired JWT string'});
                }
                else if(error instanceof JOSEError){
                    console.log('Unknown Jose Error');
                    return NextResponse.json({error:'Unknown token decryption error'},
                        {status:401,statusText:'Unknown token decryption error'});
                }
                console.log('Error from refresh token operation');
                    return NextResponse.json({error:'Error from refresh token operation'},
                        {status:401,statusText:'Error from refresh token operation'});    
            }
            console.log('Error from refresh token operation');
            return NextResponse.json({error:'Error from refresh token operation'},
                        {status:401,statusText:'Error from refresh token operation'});    
        }
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
                maxAge: 60 * 60 * 24 * 7,
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
    const user = await User.findById(userId);
    //false 
    if(!user || user.refreshToken !== oldRefreshToken){
        return NextResponse.json({error:'Invalid refresh token'},{status:401});
    }
    const newAccessToken = await new SignJWT({
        email:user.email,
        name:user.name,
        role:user.role,
        stage:user.stage,
        userId:user._id.toString()
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
            userId:user._id.toString()
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