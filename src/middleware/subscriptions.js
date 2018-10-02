import log from 'sistemium-telegram/services/log';
import Markup from 'telegraf/markup';
import map from 'lodash/map';
import { subscriptionSettings } from '../services/userSettings';

const { debug } = log('subscriptions');

const allSettings = subscriptionSettings();

export async function showSettings(ctx) {

  const { session } = ctx;
  const { settings = {}, lastSubscriptionSettingsMessageId } = session;

  if (lastSubscriptionSettingsMessageId) {
    ctx.deleteMessage(lastSubscriptionSettingsMessageId);
  }

  const { reply, keyboard } = settingsView(settings);

  const { message_id: messageId } = await ctx.reply(reply, keyboard);

  session.lastSubscriptionSettingsMessageId = messageId;

}

export async function onToggleSetting(ctx) {

  const { match, session: { settings = {} } } = ctx;

  const [, setting, newValue] = match;

  debug(setting, newValue);

  settings[setting] = (newValue === 'on');

  ctx.session.settings = settings;

  ctx.answerCbQuery('Готово!');

  const { reply, keyboard } = settingsView(settings);

  await ctx.editMessageText(reply, keyboard);

}

function settingsView(settings) {

  const buttons = map(allSettings, ({ label, defaultValue }, code) => {

    const val = (settings[code] === undefined ? defaultValue : settings[code]);
    const txt = `${label}: ${val ? 'Да' : 'Нет'}`;
    const action = `toggle_${code}_${val ? 'off' : 'on'}`;

    return [Markup.callbackButton(txt, action)];

  });

  const keyboard = Markup.inlineKeyboard(buttons).extra();
  const reply = 'Твои настройки уведомлений:';

  // debug(JSON.stringify(keyboard));

  return {
    reply,
    keyboard,
  };

}
