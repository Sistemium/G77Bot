import * as redis from 'sistemium-telegram/services/redis';
import log from 'sistemium-debug';

// export * from './queues';

const { error } = log('store');

redis.client.on('disconnect', error);
