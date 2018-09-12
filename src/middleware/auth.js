import log from 'sistemium-telegram/services/log';
import * as pha from '../services/auth';

const { debug, error } = log('auth');

export async function auth(ctx) {

  const { match, session } = ctx;

  if (!match) {
    await ctx.reply('Укажите номер вашего мобильного телефона');
    return;
  }

  const [, phoneNumber] = match;

  if (!phoneNumber) {

    if (session.account) {
      await getRoles(ctx);
    } else {
      await ctx.reply('Укажите номер вашего мобильного телефона');
    }

    return;

  }

  debug('auth', phoneNumber);

  try {

    const id = await pha.login(phoneNumber);

    const res = [
      'Теперь пришлите код, который я отправил в СМС-сообщении',
      `на номер ${phoneNumber}`,
    ];

    debug('auth got id:', id);

    session.auth = id;

    ctx.reply(res.join(' '));

  } catch (e) {
    error(e.message);
    await ctx.reply(`Я не знаю пользователя с телефоном ${phoneNumber}`);
  }

}

export async function confirm(ctx) {

  const { message: { text: code }, session } = ctx;

  if (!session.auth) {
    replyNotAuthorized(ctx);
    return;
  }

  const isCode = /^\d+$/.test(code);

  if (!isCode) {
    ctx.reply('Вы должны прислать цифровой код из СМС, которое я вам отправил');
    return;
  }

  try {

    const { accessToken } = await pha.confirm(code, session.auth);

    const { account, roles } = await pha.roles(accessToken);

    Object.assign(session, { account, roles, accessToken });

    delete session.auth;

    const { name } = account;

    await ctx.replyHTML(`<b>${name}</b>, добро пожаловать в Телеграм-бота «Город 77»!`);

  } catch (e) {
    await ctx.reply('Неправильный код!');
  }


}

export async function getRoles(ctx) {

  const { session: { account: roles } } = ctx;

  if (!roles) {
    await replyNotAuthorized(ctx);
    return;
  }

  ctx.replyJson(roles);

}


function replyNotAuthorized(ctx) {
  ctx.reply('Сначала пришлите мне свой номер телефона командой /auth');
}
