/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function onNewMember(ctx) {

  const { message: { new_chat_member: member } } = ctx;
  const { first_name: firstName, last_name: lastName } = member;

  await ctx.replyWithHTML(`👏 Поприветствуем нового коллегу по имени <b>${firstName} ${lastName}</b>!`);

}

/**
 *
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function onLeftMember(ctx) {

  const { message: { left_chat_member: member } } = ctx;
  const { first_name: firstName, last_name: lastName } = member;

  await ctx.replyWithHTML(`😮 Эх, нас покинул <b>${firstName} ${lastName}</b>, ну, удачи ему!`);

}
