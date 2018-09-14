import * as auth from './auth';

export default async function onContact(ctx) {

  const {
    update: { message: { contact } },
  } = ctx;

  const phoneNumber = contact.phone_number
    .replace(/^370/, '820')
    .replace(/^7/, '8');

  ctx.match = ['', phoneNumber];

  await auth.auth(ctx);

}
