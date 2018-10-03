import bot, { BOT_ID } from 'sistemium-telegram/services/bot';
import log from 'sistemium-telegram/services/log';
import { client as redis } from 'sistemium-telegram/services/redis';
import session from 'sistemium-telegram/services/session';
import contextConfig from 'sistemium-telegram/config/context';

import 'sistemium-telegram/config/aws';
import { setupSqsConsumers } from './services/sqsConsumer';
import setupCommands from './commands';

const { error } = log('index');

contextConfig(bot);

bot.use(exceptionHandler);
bot.use(session({ botId: BOT_ID })
  .middleware());

setupCommands(bot);

redis.on('ready', async () => {
  await setupSqsConsumers();
  bot.startPolling();
});

/*
Exception handlers
*/

async function exceptionHandler(ctx, next) {

  try {
    await next();
  } catch ({ message, stack }) {
    error('exceptionHandler', stack);
    await ctx.replyWithHTML(`Ошибка: <b>${message}</b>`);
  }

}

bot.catch(({ name, message }) => {
  error(name, message);
});
