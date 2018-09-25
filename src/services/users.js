import {
  hgetallAsync, hsetAsync, hgetAsync, hdelAsync,
} from 'sistemium-telegram/services/redis';
import map from 'lodash/map';

const USERS_KEY = 'users';

export async function addUser(org, id, data) {

  return hsetAsync(orgKey(org), id, JSON.stringify({
    ...data,
    id,
  }));

}

export async function removeUser(org, id) {

  return hdelAsync(orgKey(org), id);

}

export async function findAll(org) {

  const data = await hgetallAsync(orgKey(org));

  return map(data, JSON.parse);

}

export async function find(org, id) {

  const data = await hgetAsync(orgKey(org), id);

  return data ? JSON.parse(data) : null;

}


function orgKey(org) {
  return `${USERS_KEY}_${org}`;
}
