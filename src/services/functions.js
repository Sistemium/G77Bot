export default function validatePhoneNumber(phone) {

  if (!phone) {

    return phone;

  }

  let phoneNumber = phone.replace(/[^0-9]+/, '');

  if (!phoneNumber.match(/\d/g)) {

    return undefined;

  }

  phoneNumber = phoneNumber
    .replace(/^370/, '820')
    .replace(/^7/, '8');

  if (phoneNumber.length !== 11) {

    return undefined;

  }

  return phoneNumber;

}
