import Telegraf from 'telegraf';
import log from 'sistemium-telegram/services/log';
import start from './middleware/start';
import calc from './middleware/calc';
import * as members from './middleware/members';
import * as saleOrders from './middleware/saleOrders';
import onContact from './middleware/contact';
import * as queues from './middleware/queues';

import { settingsOptions } from './services/keyboard';
import * as auth from './middleware/auth';
import * as subscriptions from './middleware/subscriptions';

const { debug } = log('commands');

/**
 * Configures the bot commands
 * @param {Composer} bot
 */
export default function (bot) {

  bot.hears(/^\/add[ _]queue (.+)$/, queues.add);
  bot.hears(/^\/list[ _]queues$/, queues.list);
  bot.hears(/^\/remove[ _]queue$/, queues.remove);

  bot.command('start', start);
  bot.command('logout', auth.logout);
  bot.command('roles', auth.getRoles);
  bot.command('orders', saleOrders.listSaleOrders);

  bot.command('subscriptions', subscriptions.showSettings);
  bot.hears('Настройки', subscriptions.showSettings);
  bot.action(/toggle_(.+)_(on|off)/, subscriptions.onToggleSetting);

  bot.hears(/^\/so_(\d+)$/, saleOrders.showSaleOrder);

  bot.action(/salOrder_(\d+)_(.+)/, saleOrders.saleOrderActions);

  /*
  Authorization
   */

  bot.hears(/^\/auth[ ](\d+)$/, auth.auth);
  bot.command('auth', Telegraf.branch(auth.isAuthorized, start, auth.auth));

  bot.hears('Ввести другой номер', auth.onOtherPhone);
  bot.hears('Отменить', auth.onCancel);

  bot.on('contact', onContact);
  bot.on('message', Telegraf.optional(authIsWaitingForPhone, onContact));
  bot.on('message', Telegraf.optional(authIsWaitingForCode, auth.confirm));

  bot.command('confirm', auth.confirm);


  /*
  Test thing
   */

  bot.hears(/^=(\d)([+\-*/])(\d)/, calc);

  bot.on('new_chat_members', members.onNewMember);
  bot.on('left_chat_member', members.onLeftMember);

  bot.on('message', onMessage);

}

function authIsWaitingForCode(ctx) {
  return ctx.session.waitingForCode;
}

function authIsWaitingForPhone(ctx) {
  return ctx.session.waitingForPhone;
}

async function onMessage(ctx) {

  const {
    message,
    chat: { id: chatId },
    from: { id: fromId },
  } = ctx;

  if (chatId !== fromId) {
    debug('ignore chat message', chatId, message.text);
    return;
  }

  await ctx.reply('Я такое не понимаю пока', settingsOptions());

}
