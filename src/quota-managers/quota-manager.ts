import { App } from '../app';
import { QuotaManagerInterface } from './quota-manager-interface';
import { RedisQuotaManager } from './redis-quota-manager';
import { Server } from '../server';
import { Log } from '../log';

export class QuotaManager implements QuotaManagerInterface {
    /**
     * The quota manager driver.
     */
    public driver: QuotaManagerInterface;

    /**
     * Initialize the quota manager driver.
     */
    constructor(server: Server) {
        if (server.options.quotaManager.driver === 'redis') {
            this.driver = new RedisQuotaManager(server);
        } else {
            Log.error('No quota manager driver specified.');
        }
    }

    /**
     * Check if an app has remaining message quota.
     */
    async hasRemainingQuota(app: App): Promise<boolean> {
        return this.driver.hasRemainingQuota(app);
    }

    /**
     * Increment the message count for an app.
     */
    async incrementCount(appId: string, incrementCount: number): Promise<void> {
        return this.driver.incrementCount(appId, incrementCount);
    }

    /**
     * Get the current message count for an app.
     */
    async getCurrentCount(appId: string): Promise<number> {
        return this.driver.getCurrentCount(appId);
    }

    /**
     * Disconnect the manager's made connections.
     */
    disconnect(): Promise<void> {
        return this.driver.disconnect();
    }
} 