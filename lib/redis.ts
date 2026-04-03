import Redis from 'ioredis';
import 'dotenv/config';



export interface Message {
  id: number | string;
  sender: string | 'self';
  content: string;
  timestamp: string | Date;
}

export interface MessageThread {
  id: number | string;
  userId:string;
  subject: string;
  is_new?:boolean;
  timestamp: Date;
  read: boolean;
  user?:{
      id:string,
      name:string,
  },
  admin_read?: boolean;
  updatedAt: Date;
  messages: Message[];
  isDraft?: boolean;
  draft?: string;
}

export interface CloseChat {
  id:number|string;
  close:boolean;
}


//const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
//console.log("REDIS PASSWORD");
//console.log(process.env.REDIS_PASSWORD);
//console.log(process.env.NEXT_PUBLIC_SOCKET_URL);

const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  password: process.env.REDIS_PASSWORD,        
  retryStrategy: (times: number): number | null => {
    // Stop retrying after 10 attempts
    if (times > 10) {
      console.error('Redis connection failed after 10 attempts');
      return null;        // stop retrying
    }
    // Exponential backoff: 50ms, 100ms, 150ms, ..., max 2000ms
    return Math.min(times * 50, 2000);
  },
  // Optional: reconnect on error
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;   // retry on readonly error (e.g. failover)
    }
    return false;
  },
};

export const redis = new Redis(redisConfig);
export const pubClient = new Redis(redisConfig);
export const subClient = new Redis(redisConfig);


// Graceful shutdown
process.on('SIGINT', async () => {
  await pubClient.quit();
  await subClient.quit();
  await redis.quit();
  process.exit(0);
});