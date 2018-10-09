import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
import unique from 'lodash/uniq';
import log from 'sistemium-telegram/services/log';

import Markup from 'telegraf/markup';

import { settingsOptions } from '../services/keyboard';
import {
  findAll,
  find,
  update,
  remove,
} from '../services/api';
import { nameForConfig } from '../services/dictionary';

const { debug } = log('saleOrders');

export async function listSaleOrders(ctx) {

  const { session: { accessToken: authorization, roles: { org } } } = ctx;

  await ctx.replyWithChatAction('typing');

  const saleOrders = await findAll('SaleOrder', org, authorization, { processing: 'draft' });

  if (!saleOrders.length) {

    ctx.reply('Нет черновиков', settingsOptions(ctx));

    return;

  }

  const outletIds = unique(map(saleOrders, 'outletId'));

  debug('got', saleOrders.length, 'saleOrders');

  const where = JSON.stringify({ id: { '==': outletIds } });

  const outlets = await findAll('Outlet', org, authorization, { 'where:': where });

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

  const { session: { accessToken: authorization, roles: { org } }, match } = ctx;

  const [, num] = match;

  const saleOrder = await find('SaleOrder', org, authorization, { num });

  if (!saleOrder) {
    await ctx.reply(`Нет заказа с номером ${num}`);
    return;
  }

  saleOrder.outlet = await find('Outlet', org, authorization, { id: saleOrder.outletId });

  const workflow = await find('Workflow', org, authorization, { code: 'saleOrder.v2' });

  const res = [
    `Заказ для «${saleOrder.outlet.name}»`,
    `на сумму: ${saleOrder.totalCost}₽`,
    `статус заказа: <b>${nameForConfig(workflow.workflow, saleOrder.processing)}</b>`,
  ];

  const kb = Markup.inlineKeyboard([
    Markup.callbackButton('Передать в работу', actionData('upload')),
    Markup.callbackButton('Удалить', actionData('delete')),
  ])
    .extra();

  await ctx.replyWithHTML(res.join('\n'), kb);

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

  const { session: { accessToken: authorization, roles: { org } }, match } = ctx;

  const [, num, actionName] = match;

  const saleOrder = await find('SaleOrder', org, authorization, { num });

  switch (actionName) {
    case 'upload': {

      const result = await update('SaleOrder', org, authorization, {
        id: saleOrder.id,
        processing: 'upload',
      });

      if (result.processing === 'draft') {

        await ctx.reply('❌ Ошибка передачи', settingsOptions(ctx));

        return;

      }

      await ctx.reply('✅ Заказ успешно передан в работу', settingsOptions(ctx));

      break;

    }
    case 'delete': {

      const result = await remove('SaleOrder', org, authorization, saleOrder.id);

      if (result.status === 200) {

        await ctx.reply('✅ Заказ успешно удален', settingsOptions(ctx));

        return;

      }

      await ctx.reply('❌ Ошибка удаления', settingsOptions(ctx));

      break;

    }
    default:
  }

}
