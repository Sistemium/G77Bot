import log from 'sistemium-telegram/services/log';
import { BOT_USER_NAME } from 'sistemium-telegram/services/bot';
import Markup from 'telegraf/markup';
import map from 'lodash/map';
import { subscriptionSettings } from '../services/userSettings';

const { debug, error } = log('subscriptions');

export async function showSettings(ctx) {

  const { session, chat, from } = ctx;
  const { settings = {}, lastSubscriptionSettingsMessageId, account } = session;

  if (chat.id !== from.id) {
    const replyGoPrivate = [
      `Чтобы посмотреть настройки уведомлений зайди ко мне в чат @${BOT_USER_NAME}`,
    ];
    await ctx.replyWithHTML(replyGoPrivate.join('\n'));
    return;
  }

  if (!account) {
    await ctx.replyWithHTML('Сперва тебе нужно авторизоваться, нажми /auth');
    return;
  }

  if (lastSubscriptionSettingsMessageId) {
    ctx.deleteMessage(lastSubscriptionSettingsMessageId)
      .catch(error);
  }

  const { text, keyboard } = settingsView(settings, account.org);

  const { message_id: messageId } = await ctx.reply(text, keyboard);

  session.lastSubscriptionSettingsMessageId = messageId;

}

export async function onToggleSetting(ctx) {

  const { match, session: { settings = {} } } = ctx;

  const [, setting, newValue] = match;

  debug(setting, newValue);

  settings[setting] = (newValue === 'on');

  ctx.session.settings = settings;

  ctx.answerCbQuery('Готово!')
    .catch(error);

  const { text, keyboard } = settingsView(settings);

  await ctx.editMessageText(text, keyboard);

}

function settingsView(settings, org) {

  const allSettings = subscriptionSettings(org);

  const buttons = map(allSettings, ({ label, defaultValue }, code) => {

    const val = (settings[code] === undefined ? defaultValue : settings[code]);
    const txt = `${label}: ${val ? 'Присылать' : 'Не присылать'}`;
    const action = `toggle_${code}_${val ? 'off' : 'on'}`;

    return [Markup.callbackButton(txt, action)];

  });

  const keyboard = Markup.inlineKeyboard(buttons).extra();
  const text = 'Твои настройки уведомлений:';

  // debug(JSON.stringify(keyboard));

  return {
    text,
    keyboard,
  };

}
