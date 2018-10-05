import log from 'sistemium-telegram/services/log';

import { explainAuth } from './auth';

import { isAuthorized } from '../services/auth';

import { orgName } from '../services/org';

const { debug } = log('start');

export default async function (ctx) {

  const {
    message: {
      from: {
        id: userId,
        first_name: firstName,
        last_name: lastName,
      },
    },
    session,
  } = ctx;

  debug(userId, firstName, lastName);

  const res = [
    `Здравствуй, <b>${firstName} ${lastName}</b>!`,
    `Твой ид Телеграм: <b>${userId}</b>`,
    '',
  ];

  if (!isAuthorized(ctx)) {
    await explainAuth(ctx);
    return;
  }

  const { salesman, supervisor, org } = session.roles;

  res.push(`Ты авторизовался под номером: <b>${session.phoneNumber}</b>`);
  res.push(`Организация: <b>${orgName(org)}</b>`);

  const roles = [];

  if (supervisor) {
    roles.push('Супервайзер');
  }

  if (salesman) {
    roles.push('Торговый представитель');
  }

  if (roles.length) {
    res.push(`Тебе назначены роли: ${roles.map(role => `<b>${role}</b>`)
      .join(', ')}`);
  }

  await ctx.replyWithHTML(res.join('\n'));

}
