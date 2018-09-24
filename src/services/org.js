export const config = {
  r50: {
    label: 'Регион-50',
  },
  bs: {
    label: 'Город 77',
  },
  dr50: {
    label: 'Регион-50 тест',
  },
  dev: {
    label: 'Город 77 тест',
  },
  r50p: {
    label: 'ИБИС',
  },
};

export function orgName(code) {
  const org = config[code];
  return org && org.label || code;
}
