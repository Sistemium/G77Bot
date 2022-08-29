import log from 'sistemium-debug';

const { debug } = log('calc');

export default async function (ctx) {

  const { match } = ctx;

  const [text, a1, op, a2] = match;

  const a = parseInt(a1, 0);
  const b = parseInt(a2, 0);

  debug(a, op, b);

  let res;

  switch (op) {
    case '+':
      res = a + b;
      break;
    case '-':
      res = a - b;
      break;
    case '*':
      res = a * b;
      break;
    case '/':
      res = a / b;
      break;
    default:
      ctx.reply('Я не понял!');
      return;
  }

  await ctx.replyWithHTML(`${res}${text}`);

}
