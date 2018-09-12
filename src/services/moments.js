import { format, addDays } from 'date-fns';

// import { ru } from 'date-fns/esm/locale';


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
