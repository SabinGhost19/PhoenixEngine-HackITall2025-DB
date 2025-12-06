import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || 'redis';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');

// Create a singleton instance
declare global {
    var redis: Redis | undefined;
}

let redis: Redis;

if (!global.redis) {
    global.redis = new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        db: 0,
    });
}
redis = global.redis;

export default redis;
