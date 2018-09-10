import axios from 'axios';

const API_URL = 'https://api.sistemium.com/v4d/dr50';

// eslint-disable-next-line
export function findAll(name, authorization, params) {

  return axios.get(apiurl(name), {
    params,
    headers: { authorization },
  })
    .then(({ data }) => data);

}


function apiurl(name) {
  return `${API_URL}/${name}`;
}
