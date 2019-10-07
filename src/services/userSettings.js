import { BOT_ID } from 'sistemium-telegram/services/bot';
import { getSession } from 'sistemium-telegram/services/session';
import lo from 'lodash';

const LIKE_R50 = /r50p?/;
const LIKE_BS = /bs|dev/;

const ALL_SETTINGS = {
  SaleOrderStatus: {
    label: 'Статусы заказов',
    defaultValue: true,
  },
  OutletStatus: {
    label: 'Статусы торговых точек',
    defaultValue: true,
    orgRe: LIKE_R50,
  },
  ContractStatus: {
    label: 'Статусы договоров',
    defaultValue: true,
    orgRe: LIKE_R50,
  },
  StockGone: {
    label: 'Больше нет на складе',
    defaultValue: false,
  },
  DebtPaid: {
    label: 'Оплата долгов',
    defaultValue: false,
    orgRe: LIKE_BS,
  },
};


export async function userSettings(userId, setting) {

  const { settings = {} } = await getSession(BOT_ID, userId);

  const value = settings[setting];

  return value === undefined ? lo.get(ALL_SETTINGS[setting], 'defaultValue') : value;

}


export function subscriptionSettings(org) {
  return lo.pickBy(ALL_SETTINGS, ({ orgRe }) => !orgRe || orgRe.test(org));
}
