import * as redis from '../services/redisDB';

const KEY = 'queues';

export async function getAll() {
  return redis.getAll(KEY);
}


export async function save(id, data) {
  return redis.save(KEY, id, data);
}
