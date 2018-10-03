import * as redis from 'sistemium-telegram/services/redis';
import map from 'lodash/map';

export async function getAll(hashName) {
  return redis.hgetallAsync(hashName)
    .then(res => map(res, (data, id) => ({ id, ...JSON.parse(data) })));
}

export async function save(hashName, id, data) {
  return redis.hsetAsync(hashName, id, JSON.stringify(data))
    .then(() => ({ ...data, id }));
}

export async function del(hashName, id) {
  return redis.hdelAsync(hashName, id)
    .then(() => ({ id }));
}
