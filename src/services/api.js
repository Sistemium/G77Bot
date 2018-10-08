import axios from 'axios';

const { API_URL, STAPI_TOKEN } = process.env;

if (!STAPI_TOKEN) {
  throw new Error('STAPI_TOKEN is not set');
}

export function findAll(name, org, authorization, params) {

  return axios.get(apiUrl(org, name), {
    params,
    headers: { authorization },
  })
    .then(({ data }) => data);

}

export function find(name, org, authorization, params) {

  return axios.get(apiUrl(org, name), {
    params,
    headers: { authorization },
  })
    .then(({ data }) => data && data[0]);

}


function apiUrl(org, name) {
  return `${API_URL}/${org}/${name}`;
}

export function create(name, org, authorization, attrs) {

  return axios.post(apiUrl(org, name), attrs, {
    headers: { authorization: authorization || STAPI_TOKEN },
  })
    .then(({ data }) => data);

}
