import log from 'sistemium-debug';
import { findAll, save, del } from '../store/queues';
import { addSqsConsumer, removeSqsConsumer } from '../services/sqsConsumer';


const { debug } = log('queues');

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function add(ctx) {

  const { match, chat: { id: chatId } } = ctx;
  const [, url, inlineId] = match;
  const id = inlineId ? parseInt(inlineId, 0) : chatId;

  debug('add', id, url);

  await save(id, { url });

  addSqsConsumer(id, url);

  await ctx.replyWithHTML(`Добавил новую очередь для чата <b>${id}</b>`);

}

export async function remove(ctx) {

  const { chat: { id: chatId }, match } = ctx;
  const [, inlineId] = match;
  const id = inlineId ? parseInt(inlineId, 0) : chatId;

  debug('remove', id);

  const exists = await del(id);

  if (!exists) {
    await ctx.replyWithHTML(`Не нашел очередь чата <b>${id}</b> и ничего не удалил`);
    return;
  }

  removeSqsConsumer(id);

  await ctx.replyWithHTML(`Удалил очередь чата <b>${id}</b>`);

}

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function list(ctx) {

  const queues = await findAll();

  debug('list', queues.length);

  if (!queues.length) {

    await ctx.replyWithHTML('Список очередей пуст, добавь командой /add_queue');

    return;
  }

  const res = queues.map(JSON.stringify)
    .join('\n');

  await ctx.replyWithHTML(res);

}
