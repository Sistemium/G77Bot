/* eslint-disable import/prefer-default-export */
import Markup from 'telegraf/markup';

export function settingsOptions() {

  const buttons = [
    ['Настройки'],
  ];

  return Markup
    .keyboard(buttons)
    .resize()
    .extra();

}

export function removeKeyboardOptions() {

  return Markup.removeKeyboard()
    .extra();

}
