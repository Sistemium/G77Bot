import axios from 'axios';

const { API_URL } = process.env;

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
