import log from 'sistemium-debug';
import Markup from 'telegraf/markup';
import * as pha from '../services/auth';
import validatePhoneNumber from '../services/functions';
import { addUser, removeUser } from '../services/users';
import { orgName } from '../services/org';

const { debug, error } = log('auth');

const REMOVE_KEYBOARD = Markup.removeKeyboard()
  .extra();

export async function auth(ctx) {

  const { match } = ctx;

  const [, phoneNumber] = match || [];

  debug('auth', phoneNumber);

  if (phoneNumber) {
    await authWithPhone(ctx, phoneNumber);
  } else {
    await explainAuth(ctx);
  }

}


export async function authWithPhone(ctx, phoneNumberNotValidated) {

  const phoneNumber = validatePhoneNumber(phoneNumberNotValidated);

  debug('authWithPhone', phoneNumberNotValidated, phoneNumber);

  if (!phoneNumber) {
    throw new Error('❌ Неверный номер телефона');
  }

  const { session } = ctx;

  try {

    const id = await pha.login(phoneNumber);

    debug('auth got id:', id);

    session.tempPhoneNumber = phoneNumber;
    session.waitingForCode = id;

    delete session.waitingForPhone;

  } catch ({ message }) {
    error(message);
    await ctx.reply(`Я не знаю пользователя с телефоном ${phoneNumber}`);
    return;
  }

  const reply = [
    '✅ Теперь пришли код, который я отправил в СМС-сообщении',
    `на номер ${phoneNumber}`,
  ].join(' ');

  await ctx.reply(reply, REMOVE_KEYBOARD);

}

export async function confirm(ctx) {

  const { message: { text: code }, from: { id: userId }, session } = ctx;

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

    const { account, roles, roles: { org, salesman } } = await pha.roles(accessToken);

    Object.assign(session, {
      account,
      roles,
      accessToken,
    });

    delete session.waitingForCode;
    session.phoneNumber = session.tempPhoneNumber;
    delete session.tempPhoneNumber;

    const { name, authId } = account;

    await addUser(org, userId, {
      org,
      phoneNumber: session.phoneNumber,
      name,
      salesman,
      authId,
    });

    await ctx.replyHTML([
      `✅ <b>${name}</b>, добро пожаловать в Телеграм-бота «${orgName(org)}»!`,
      '',
      'Нажми /subscriptions чтобы посмотреть настройки уведомлений, которые я могу присылать.',
    ].join('\n'));

  } catch (e) {
    await ctx.reply('❌ Неправильный код!');
  }


}

export async function logout(ctx) {

  const options = Markup.removeKeyboard()
    .extra();

  try {

    const { session, from: { id: userId } } = ctx;

    const { org } = session.roles;

    session.phoneNumber = undefined;
    session.waitingForPhone = undefined;
    session.tempPhoneNumber = undefined;
    session.waitingForCode = undefined;
    session.account = undefined;
    session.roles = undefined;

    await removeUser(org, userId);

    await ctx.reply('Ок', options);

  } catch (e) {
    await ctx.reply('Что-то пошло не так', options);
    error(e);
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


export function isAuthorized(ctx) {
  return !!ctx.session.account;
}


export async function explainAuth(ctx) {

  const { session } = ctx;
  session.waitingForPhone = true;

  const reply = 'Ты должен авторизоваться, чтобы работать со мной. Пришли свой номер телефона.';

  const buttons = [
    [{
      text: 'Использовать текущий номер',
      request_contact: true,
    }],
    ['Ввести другой номер'],
    ['Отменить'],
  ];

  const options = Markup
    .keyboard(buttons)
    .oneTime()
    .resize()
    .extra();

  await ctx.reply(reply, options);

}

export async function onCancel(ctx) {

  const { session } = ctx;

  delete session.waitingForPhone;
  delete session.waitingForCode;
  delete session.tempPhoneNumber;

  await ctx.reply('Хорошо, потом авторизуешься - нажми /auth когда решишься', REMOVE_KEYBOARD);

}

export async function onOtherPhone(ctx) {
  const { session } = ctx;
  session.waitingForPhone = true;
  await ctx.reply('Напиши номер телефона через 8ку или +7', REMOVE_KEYBOARD);
}

function replyNotAuthorized(ctx) {
  ctx.reply('Сначала пришлите мне свой номер телефона командой /auth');
}
