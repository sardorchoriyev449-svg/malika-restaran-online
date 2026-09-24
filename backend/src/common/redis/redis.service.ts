import { Injectable } from "@nestjs/common";
import Redis from "ioredis";

@Injectable()
export class RedisService {
    private readonly redis: Redis;

    constructor() {
        // Agar REDIS_URL berilgan bo'lsa (masalan Upstash kabi production xizmatida),
        // shuni ishlatamiz — u TLS (rediss://) va parolni o'z ichiga oladi.
        // Aks holda mahalliy REDIS_HOST/REDIS_PORT'ga qaytamiz.
        const redisUrl = process.env.REDIS_URL
            ?? `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

        this.redis = new Redis(redisUrl, {
            maxRetriesPerRequest: 3
        });
    }

    async set(key: string, date: any, ttl: number = 15 * 60) {
        return await this.redis.setex(key, ttl, date);
    }

    async get(key: string) {
        return await this.redis.get(key);
    }

    async delete(key: string) {
        return await this.redis.del(key);
    }
}