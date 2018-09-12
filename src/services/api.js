import axios from 'axios';

const { API_URL, STAPI_TOKEN } = process.env;

if (!STAPI_TOKEN) {
  throw new Error('STAPI_TOKEN is not set');
}

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

export function create(name, authorization, attrs) {

  return axios.post(apiUrl(name), attrs, {
    headers: { authorization: authorization || STAPI_TOKEN },
  })
    .then(({ data }) => data);

}
