import log from 'sistemium-telegram/services/log';

const { error } = log('start');

export default async function logout(ctx) {

  try {

    const { session } = ctx;

    session.phoneNumber = undefined;
    session.waitingForPhone = undefined;
    session.tempPhoneNumber = undefined;
    session.waitingForCode = undefined;

    await ctx.reply('Ок');

  } catch (e) {
    await ctx.reply('Что-то пошло не так');
    error(e);
  }

}
