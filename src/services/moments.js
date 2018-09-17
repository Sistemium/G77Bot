import { format, addDays, getHours } from 'date-fns';
import log from 'sistemium-telegram/services/log';

const { debug } = log('moments');

// import { ru } from 'date-fns/esm/locale';

const { NOTIFY_HOUR_MIN, NOTIFY_HOUR_MAX } = process.env;

const notifyHourMin = parseInt(NOTIFY_HOUR_MIN, 0) || 9;
const notifyHourMax = parseInt(NOTIFY_HOUR_MAX, 0) || 20;

debug('Notification time is from', notifyHourMin, 'to', notifyHourMax);

export function dateFormat(date) {

  return format(date, 'dd.MM.y');

}

export function dateTimeFormat(utcDate) {

  const date = utcDate instanceof Date ? utcDate : `${utcDate}Z`;
  return format(date, 'dd.MM.y в HH:mm');

}

export function serverDateFormat(date = new Date()) {

  return format(utcTimeString(date), 'YYYY-MM-dd');

}

export function serverDateTimeFormat(date = new Date()) {

  return format(utcTimeString(date), 'YYYY-MM-dd HH:mm:ss.SSS');

}

export function tomorrow(date = new Date()) {
  return addDays(date, 1);
}

function utcTimeString(localDate = new Date()) {
  return localDate.toUTCString().replace(' GMT', '');
}

export function isNotifyTime(date = new Date()) {

  const hours = getHours(date);

  return hours >= notifyHourMin && hours <= notifyHourMax;

}
