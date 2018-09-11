import axios from 'axios';

const API_URL = 'https://api.sistemium.com/v4d/dr50';
// const API_URL = 'http://localhost:9090/api/dr50';

export function findAll(name, authorization, params) {

  return axios.get(apiUrl(name), {
    params,
    headers: { authorization },
  })
    .then(({ data }) => data);

}

export function find(name, authorization, params) {

  return axios.get(apiUrl(name), {
    params,
    headers: { authorization },
  })
    .then(({ data }) => data && data[0]);

}


function apiUrl(name) {
  return `${API_URL}/${name}`;
}
