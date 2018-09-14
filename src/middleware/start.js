import log from 'sistemium-telegram/services/log';
import Markup from 'telegraf/markup';

const { debug, error } = log('start');

export default async function (ctx) {

  const {
    message: {
      from: {
        id: userId,
        first_name: firstName,
        last_name: lastName,
      },
    },
    session,
  } = ctx;

  debug(userId, firstName, lastName);

  try {

    const res = [
      `Здравствуй, <b>${firstName} ${lastName}</b>!`,
      `Твой ид Телеграм <code>${userId}</code>`,
      '',
    ];

    let option = {};

    if (!session.phoneNumber) {

      res.push('Требуется авторизация');

      const buttons = [
        [{
          text: 'Использовать текущий номер',
          request_contact: true,
        }],
        ['Ввести другой номер'],
        ['Отменить'],
      ];

      option = Markup
        .keyboard(buttons)
        .oneTime()
        .resize()
        .extra();

      debug(option);

    } else {

      res.push(`Вы авторизованы под номером ${session.phoneNumber}`);

    }

    await ctx.replyWithHTML(res.join('\n'), option);

  } catch (e) {
    await ctx.reply('Что-то пошло не так');
    error(e);
  }

}
