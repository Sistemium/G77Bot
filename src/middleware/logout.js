import Markup from 'telegraf/markup';
import log from 'sistemium-telegram/services/log';

const { error } = log('start');

export default async function logout(ctx) {

  const options = Markup.removeKeyboard()
    .extra();

  try {

    const { session } = ctx;

    session.phoneNumber = undefined;
    session.waitingForPhone = undefined;
    session.tempPhoneNumber = undefined;
    session.waitingForCode = undefined;
    session.account = undefined;

    await ctx.reply('Ок', options);

  } catch (e) {
    await ctx.reply('Что-то пошло не так', options);
    error(e);
  }

}
