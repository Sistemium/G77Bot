import * as auth from './auth';
import validatePhoneNumber from '../services/functions';

export default async function onContact(ctx) {

  const {
    update: { message: { contact } },
  } = ctx;

  const phoneNumber = validatePhoneNumber(contact.phone_number);

  ctx.match = ['', phoneNumber];

  await auth.auth(ctx);

}
