import trim from 'lodash/trim';

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function onNewMember(ctx) {

  const { message: { new_chat_member: member } } = ctx;

  await ctx.replyWithHTML(`👏 Поприветствуем нового коллегу по имени <b>${name(member)}</b>!`);

}

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function onLeftMember(ctx) {

  const { message: { left_chat_member: member } } = ctx;

  await ctx.replyWithHTML(`😮 Эх, нас покинул <b>${name(member)}</b>, ну, удачи ему!`);

}

function name({ first_name: firstName, last_name: lastName }) {
  return trim([firstName, lastName].join(' '));
}
