import * as redis from 'sistemium-telegram/services/redis';
import log from 'sistemium-telegram/services/log';

// export * from './queues';

const { error } = log('store');

redis.client.on('disconnect', error);
