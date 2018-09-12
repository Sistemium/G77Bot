import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
import unique from 'lodash/uniq';
import log from 'sistemium-telegram/services/log';

import Markup from 'telegraf/markup';

import { findAll, find } from '../services/api';

const { debug } = log('saleOrders');

export async function listSaleOrders(ctx) {

  const { session: { accessToken: authorization } } = ctx;

  const saleOrders = await findAll('SaleOrder', authorization, { processing: 'draft' });

  const outletIds = unique(map(saleOrders, 'outletId'));

  debug('got', saleOrders.length, 'saleOrders');

  const where = JSON.stringify({ id: { '==': outletIds } });

  const outlets = await findAll('Outlet', authorization, { 'where:': where });

  const outletsById = keyBy(outlets, 'id');

  saleOrders.forEach(saleOrder => {
    Object.assign(saleOrder, {
      outlet: outletsById[saleOrder.outletId],
      // num: idx + 1,
    });
  });

  const res = saleOrders.map(formatSaleOrder);

  await ctx.replyHTML(res.join('\n\n'));

}


function formatSaleOrder(saleOrder) {

  return [
    `/so_${saleOrder.num} «${saleOrder.outlet.name}»`,
    `${saleOrder.totalCost || 0}₽ на ${saleOrder.date}`,
  ].join('\n');

}

/**
 * Shows a single saleOrder's details
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function showSaleOrder(ctx) {

  const { session: { accessToken: authorization }, match } = ctx;

  const [, num] = match;

  const saleOrder = await find('SaleOrder', authorization, { num });

  debug('showSaleOrder', num, saleOrder);

  if (!saleOrder) {
    await ctx.reply(`Нет заказа с номером ${num}`);
    return;
  }

  saleOrder.outlet = await find('Outlet', authorization, { id: saleOrder.outletId });

  const res = [
    `Заказ для «${saleOrder.outlet.name}»`,
    `на сумму: ${saleOrder.totalCost}₽`,
    `статус заказа: <b>${saleOrder.processing}</b>`,
  ];

  await ctx.replyWithHTML(res.join('\n'));

  const kb = Markup.inlineKeyboard([
    Markup.callbackButton('Передать в работу', actionData('upload')),
    Markup.callbackButton('Удалить', actionData('delete')),
    Markup.callbackButton('Показать товары', actionData('showArticles')),
  ])
    .extra();

  const kbReply = await ctx.reply('Выберите действие:', kb);

  debug(JSON.stringify(kbReply));

  function actionData(data) {
    return `salOrder_${num}_${data}`;
  }

}

/**
 * Responds to showSaleOrder inline keyboard
 * @param {ContextMessageUpdate} ctx
 * @returns {Promise<void>}
 */

export async function saleOrderActions(ctx) {

  const { match } = ctx;

  debug(JSON.stringify(Object.keys(ctx.tg)));

  const [, num, actionName] = match;
  await ctx.answerCbQuery(`SaleOrder ${num} ${actionName}`);

}
