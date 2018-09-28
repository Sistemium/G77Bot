import * as db from 'sistemium-telegram/services/redisDB';

const USERS_KEY = 'users';

export async function addUser(org, id, data) {

  return db.save(orgKey(org), id, data);

}

export async function removeUser(org, id) {

  return db.destroy(orgKey(org), id);

}

export async function findAll(org) {

  return db.findAll(orgKey(org));

}

export async function find(org, id) {

  return db.find(orgKey(org), id);

}


function orgKey(org) {
  return `${USERS_KEY}_${org}`;
}
