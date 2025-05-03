import { App } from '../app';

export interface QuotaManagerInterface {
    /**
     * Check if an app has remaining message quota.
     */
    hasRemainingQuota(app: App): Promise<boolean>;

    /**
     * Increment the message count for an app.
     */
    incrementCount(appId: string, incrementCount: number): Promise<void>;

    /**
     * Get the current message count for an app.
     */
    getCurrentCount(appId: string): Promise<number>;

    /**
     * Disconnect the manager's made connections.
     */
    disconnect(): Promise<void>;
} 