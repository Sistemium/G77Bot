import Markup from 'telegraf/markup';

import { isAuthorized } from './auth';

export function settingsOptions(ctx) {

  const buttons = ['👤 Профиль'];

  if (isAuthorized(ctx)) {

    buttons.push('⚙ Настройки');

  }

  return Markup
    .keyboard(buttons)
    .resize()
    .extra({ parse_mode: 'HTML' });

}

export function removeKeyboardOptions() {

  return Markup.removeKeyboard()
    .extra();

}
