import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import { SQS, config } from 'aws-sdk';
import { eachSeriesAsync } from 'sistemium-telegram/services/async';

import map from 'lodash/map';
import remove from 'lodash/remove';
import { findAll } from './users';
import { userSettings, subscriptionSettings } from './userSettings';
import { isNotifyTime } from './moments';

const { debug, error } = log('sqsConsumer');
const { QUE_URL, GROUP_CHAT_ID } = process.env;
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;


if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  config.update({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  });
}

export default function init(bot) {

  const sqs = Consumer.create({
    queueUrl: QUE_URL,
    handleMessage,
    sqs: new SQS({ region: 'eu-west-1' }),
  });

  sqs.on('error', error);
  sqs.on('processing_error', error);

  sqs.start();

  debug('started');

  async function handleMessage(msg, done) {

    debug('got message');

    try {

      const payload = JSON.parse(msg.Body);
      const org = QUE_URL.match('[^-]*$');
      const {
        messageType,
        message,
        mediaGroup,
        subject,
        body,
        userId,
      } = payload;

      const users = userId ? [userId] : await generateUserArray(org, messageType);

      await filterUsers(users, messageType);

      await postMessage(bot, users, {
        message,
        mediaGroup,
        subject,
        body,
      });

      return done();
    } catch (e) {
      error(e);
      return done(e);
    }
  }

}

async function postMessage(bot, ids, options) {

  const {
    message, mediaGroup, subject, body,
  } = options;

  const opts = {
    disable_notification: !isNotifyTime(),
    parse_mode: 'HTML',
  };

  await eachSeriesAsync(ids, async id => {

    if (mediaGroup) {

      await bot.telegram.sendMessage(id, `${subjectEmoji(subject)} <b>${subject}</b>`, opts);

      const msg = map(mediaGroup, ({ src }) => ({
        media: src,
        type: 'photo',
      }));

      await bot.telegram.sendMediaGroup(id, msg, opts);

    } else {

      const msg = message
        || [
          `${subjectEmoji(subject)} <b>${subject}</b>\n`,
          parseMessageBody(body),
        ].join('\n');

      bot.telegram.sendMessage(id, msg, opts);

    }

  });

}

async function filterUsers(users, messageType) {

  if (messageType && users.length) {

    await eachSeriesAsync(users, async id => {
      const userSetting = await userSettings(id, messageType);
      if (!userSetting) {

        debug('ignored messageType:', messageType, 'for userId:', id);

        remove(users, user => user === id);

      }

    });

  }

}

async function generateUserArray(org, messageType) {

  if (Object.keys(subscriptionSettings())
    .includes(messageType)) {

    return (await findAll(org)).map(user => user.id);

  }

  return [GROUP_CHAT_ID];
}

function parseMessageBody(body) {
  return Array.isArray(body) ? formatList(body) : body;
}

function formatList(arr) {

  return arr.map(str => `• ${str}`)
    .join('\n');

}

function subjectEmoji(subject) {

  switch (subject) {
    case 'Новые товары на складе':
      return '🌟';
    case 'Больше нет на складе':
      return '⚠️';
    case 'Новые товары в каталоге':
      return '💥';
    default:
      return '🔔';
  }
}
