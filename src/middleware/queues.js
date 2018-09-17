import log from 'sistemium-telegram/services/log';
import { getAll, save } from '../store/queues';

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

  await ctx.replyWithHTML('Added');

}

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function list(ctx) {

  const queues = await getAll();

  debug('list', queues.length);

  const res = queues.map(JSON.stringify).join('\n');

  await ctx.replyWithHTML(res);

}
