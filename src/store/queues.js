import * as db from 'sistemium-telegram/services/redisDB';

const KEY = 'queues';

export async function findAll() {
  return db.findAll(KEY);
}

export async function save(id, data) {
  return db.save(KEY, id, data);
}

export async function del(id) {
  return db.destroy(KEY, id);
}
