import bot, { BOT_ID } from 'sistemium-telegram/services/bot';
import log from 'sistemium-telegram/services/log';
import session from 'sistemium-telegram/services/session';
import contextConfig from 'sistemium-telegram/config/context';

import sqsConsumer from './services/sqsConsumer';
import setupCommands from './commands';

const { error } = log('index');

contextConfig(bot);

bot.startPolling();

bot.use(exceptionHandler);
bot.use(session({ botId: BOT_ID })
  .middleware());

sqsConsumer(bot);
setupCommands(bot);

/*
Exception handlers
*/

async function exceptionHandler(ctx, next) {

  try {
    await ctx.replyWithChatAction('typing');
    await next();
  } catch ({ name, message }) {
    error('exceptionHandler', name, message);
    await ctx.replyWithHTML(`Ошибка: <b>${message}</b>`);
  }

}

bot.catch(({ name, message }) => {
  error(name, message);
});
