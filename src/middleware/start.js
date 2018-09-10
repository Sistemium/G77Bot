import log from 'sistemium-telegram/services/log';

const { debug, error } = log('start');

export default async function (ctx) {

  const { message: { from: { id: userId, first_name: firstName, last_name: lastName } } } = ctx;

  debug(userId, firstName, lastName);

  try {

    const res = [
      `Здравствуй, <b>${firstName} ${lastName}</b>!`,
      `Твой ид Телеграм <code>${userId}</code>`,
    ];

    await ctx.replyWithHTML(res.join('\n'));

  } catch (e) {
    await ctx.reply('Что-то пошло не так');
    error(e);
  }

}
