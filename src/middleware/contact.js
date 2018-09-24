import { authWithPhone } from './auth';


export default async function onContact(ctx) {

  const { message: { contact, text } } = ctx;

  const phoneNumber = contact ? contact.phone_number : text;

  await authWithPhone(ctx, phoneNumber);

}
