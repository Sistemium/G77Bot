import log from 'sistemium-telegram/services/log';
import Markup from 'telegraf/markup';
import * as pha from '../services/auth';
import validatePhoneNumber from '../services/functions';

const { debug, error } = log('auth');

export async function auth(ctx) {

  const { match, session, update: { message: { text } } } = ctx;

  let phoneNumber;

  if (match && Array.isArray(match)) {

    phoneNumber = match.slice(-1)
      .pop();

  }

  if (!phoneNumber) {

    phoneNumber = text;

  }

  const validatedPhoneNumber = validatePhoneNumber(phoneNumber);

  const options = Markup.removeKeyboard()
    .extra();

  if (!validatedPhoneNumber) {

    if (session.account) {
      await getRoles(ctx);
      return;
    }

    if (session.waitingForPhone) {

      await ctx.reply('❌ Неверный номер телефона', options);

    } else {

      await ctx.reply('Укажите номер вашего мобильного телефона', options);

    }

    session.waitingForPhone = true;

    return;

  }

  debug('auth', phoneNumber);

  try {

    const id = await pha.login(phoneNumber);

    const res = [
      '✅ Теперь пришлите код, который я отправил в СМС-сообщении',
      `на номер ${phoneNumber}`,
    ];

    debug('auth got id:', id);

    session.tempPhoneNumber = phoneNumber;

    session.waitingForCode = id;

    delete session.waitingForPhone;

    ctx.reply(res.join(' '), options);

  } catch (e) {
    error(e.message);
    await ctx.reply(`Я не знаю пользователя с телефоном ${phoneNumber}`);
  }

}

export async function confirm(ctx) {

  const { message: { text: code }, session } = ctx;

  if (!session.waitingForCode) {
    replyNotAuthorized(ctx);
    return;
  }

  const isCode = /^\d+$/.test(code);

  if (!isCode) {
    ctx.reply('Вы должны прислать цифровой код из СМС, которое я вам отправил');
    return;
  }

  try {

    const { accessToken } = await pha.confirm(code, session.waitingForCode);

    const { account, roles } = await pha.roles(accessToken);

    Object.assign(session, {
      account,
      roles,
      accessToken,
    });

    delete session.waitingForCode;
    session.phoneNumber = session.tempPhoneNumber;
    delete session.tempPhoneNumber;

    const { name } = account;

    await ctx.replyHTML(`✅ <b>${name}</b>, добро пожаловать в Телеграм-бота «Город 77»!`);

  } catch (e) {
    await ctx.reply('❌ Неправильный код!');
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
