import log from 'sistemium-telegram/services/log';
import { getAll, save, del } from '../store/queues';
import { addSqsConsumer, removeSqsConsumer } from '../services/sqsConsumer';


const { debug } = log('queues');

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function add(ctx) {

  const { match, chat: { id: chatId } } = ctx;

  const [, url] = match;

  debug('add', chatId, url);

  await save(chatId, { url });

  addSqsConsumer(chatId, url);

  await ctx.replyWithHTML('Added');

}

export async function remove(ctx) {

  const { chat: { id: chatId } } = ctx;

  debug('remove', chatId);

  await del(chatId);

  removeSqsConsumer(chatId);

  await ctx.replyWithHTML('Removed');

}

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function list(ctx) {

  const queues = await getAll();

  debug('list', queues.length);

  const res = queues.map(JSON.stringify)
    .join('\n');

  if (!res) {

    await ctx.replyWithHTML('Нет сохраненных адресов');

    return;
  }

  await ctx.replyWithHTML(res);

}
