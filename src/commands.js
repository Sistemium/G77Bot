import start from './middleware/start';
import calc from './middleware/calc';
import * as auth from './middleware/auth';


/**
 * Configures the bot commands
 * @param {Telegraf} bot
 */

export default function (bot) {

  bot.command('start', start);
  bot.command('roles', auth.getRoles);

  bot.hears(/^\/auth[ ]?(\d*)$/, auth.auth);
  bot.command('confirm', auth.confirm);

  bot.hears(/^=(\d)([+\-*/])(\d)/, calc);

  bot.on('message', onMessage);

}

async function onMessage(ctx) {

  const { session: { auth: waitingForCode } } = ctx;

  if (waitingForCode) {
    await auth.confirm(ctx);
    return;
  }

  await ctx.reply('Я такое не понимаю пока');

}
