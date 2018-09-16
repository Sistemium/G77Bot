import Markup from 'telegraf/markup';
import log from 'sistemium-telegram/services/log';
import start from './middleware/start';
import calc from './middleware/calc';
import * as members from './middleware/members';
import * as saleOrders from './middleware/saleOrders';
import onContact from './middleware/contact';
import * as auth from './middleware/auth';

const { debug } = log('commands');

/**
 * Configures the bot commands
 * @param {Composer} bot
 */
export default function (bot) {

  bot.command('start', start);
  bot.command('roles', auth.getRoles);
  bot.command('orders', saleOrders.listSaleOrders);
  bot.hears(/^\/so_(\d+)$/, saleOrders.showSaleOrder);

  bot.action(/salOrder_(\d+)_(.+)/, saleOrders.saleOrderActions);

  bot.hears(/^\/auth[ ](\d+)$/, auth.auth);
  bot.command('auth', auth.auth);

  bot.command('confirm', auth.confirm);
  bot.hears('Ввести другой номер', auth.auth);

  bot.hears(/^=(\d)([+\-*/])(\d)/, calc);

  bot.on('contact', onContact);
  bot.on('new_chat_members', members.onNewMember);
  bot.on('left_chat_member', members.onLeftMember);

  bot.on('message', onMessage);

}

async function onMessage(ctx) {

  const {
    message,
    session: { waitingForCode, waitingForPhone },
    chat: { id: chatId },
    from: { id: fromId },
  } = ctx;

  if (chatId !== fromId) {
    debug('ignore chat message', chatId, message.text);
    return;
  }

  if (waitingForPhone) {
    await auth.auth(ctx);
    return;
  }

  if (waitingForCode) {
    await auth.confirm(ctx);
    return;
  }

  const options = Markup.removeKeyboard()
    .extra();

  await ctx.reply('Я такое не понимаю пока', options);

}
