import { QuotaManagerInterface } from './quota-manager-interface';
import Redis, { Cluster, ClusterOptions, RedisOptions } from 'ioredis';
import { Server } from '../server';
import { App } from '../app';

export class RedisQuotaManager implements QuotaManagerInterface {
    /**
     * The Redis connection.
     */
    protected redisConnection: Redis|Cluster;

    /**
     * Create a new Redis quota manager instance.
     */
    constructor(protected server: Server) {
        let redisOptions: RedisOptions|ClusterOptions = {
            ...server.options.database.redis,
            ...server.options.quotaManager.redis.redisOptions,
        };

        this.redisConnection = server.options.cache.redis.clusterMode
            ? new Cluster(server.options.database.redis.clusterNodes, {
                scaleReads: 'slave',
                ...redisOptions,
            })
            : new Redis(redisOptions);
    }

    /**
     * Check if an app has remaining message quota.
     */
    async hasRemainingQuota(app: App): Promise<boolean> {
        const currentCount = await this.getCurrentCount(app.id);
        return currentCount < parseInt(app.messageQuota as string);
    }

    /**
     * Increment the message count for an app.
     */
    async incrementCount(appId: string, incrementCount: number): Promise<void> {
        const key = this.getQuotaKey(appId);
        await this.redisConnection.incrby(key, incrementCount);
    }

    /**
     * Get the current message count for an app.
     */
    async getCurrentCount(appId: string): Promise<number> {
        const key = this.getQuotaKey(appId);
        const count = await this.redisConnection.get(key);
        return count ? parseInt(count) : 0;
    }

    /**
     * Get the Redis key for an app's quota.
     */
    protected getQuotaKey(appId: string): string {
        return `app:${appId}:message_quota`;
    }

    /**
     * Disconnect the manager's made connections.
     */
    disconnect(): Promise<void> {
        return this.redisConnection.quit().then(() => {
            //
        });
    }
} 