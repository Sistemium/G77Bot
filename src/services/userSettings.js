import { BOT_ID } from 'sistemium-telegram/services/bot';
import { getSession } from 'sistemium-telegram/services/session';

const ALL_SETTINGS = {
  SaleOrderStatus: {
    label: 'Статусы заказов',
    defaultValue: true,
  },
  OutletStatus: {
    label: 'Статусы торговых точек',
    defaultValue: true,
  },
  ContractStatus: {
    label: 'Статусы договоров',
    defaultValue: true,
  },
  StockGone: {
    label: 'Больше нет на складе',
    defaultValue: false,
  },
};


export async function userSettings(userId, setting) {

  const { settings = {} } = await getSession(BOT_ID, userId);

  const value = settings[setting];

  return (value === undefined ? ALL_SETTINGS[setting].defaultValue : value);

}


export function subscriptionSettings() {
  return { ...ALL_SETTINGS };
}
