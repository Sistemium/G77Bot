import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
import unique from 'lodash/uniq';
import log from 'sistemium-telegram/services/log';

import { findAll } from '../services/api';

const { debug } = log('saleOrders');

export default async function (ctx) {

  const { session: { accessToken: authorization } } = ctx;

  const saleOrders = await findAll('SaleOrder', authorization, { processing: 'draft' });

  const outletIds = unique(map(saleOrders, 'outletId'));

  debug(outletIds);

  const where = JSON.stringify({ id: { '==': outletIds } });

  const outlets = await findAll('Outlet', authorization, { 'where:': where });

  debug(outlets);

  const outletsById = keyBy(outlets, 'id');

  const res = saleOrders.map(saleOrder => {

    const outlet = outletsById[saleOrder.outletId];
    return `<b>${saleOrder.totalCost || 0}₽</b> на ${saleOrder.date} «${outlet.name}»`;

  });

  await ctx.replyHTML(res.join('\n'));

}
