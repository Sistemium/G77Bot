import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import { SQS, config } from 'aws-sdk';
import eachSeries from 'async/eachSeries';

import { findAll } from './users';
import { userSettings } from './userSettings';
import { create } from './api';
import { serverDateFormat } from './moments';

const { debug, error } = log('sqsConsumer');
const { QUE_URL, GROUP_CHAT_ID, CREATE_NEWS } = process.env;
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

      const { messageType, message } = payload;
      const { subject, body } = payload;

      const { userId } = payload;

      const users = userId ? [{ id: userId }] : await findAll(org);

      if (messageType && users.length) {

        await eachSeries(users, async ({ id }) => {
          const userSetting = await userSettings(id, messageType);
          if (!userSetting) {
            debug('ignored messageType:', messageType, 'for userId:', id);
            return;
          }
          debug(id);
          await bot.telegram.sendMessage(id, message);
        });

        return done();

      }

      if (userId && message) {

        await bot.telegram.sendMessage(userId, message);

      } else if (subject && body) {

        await postGroupMessage(bot, subject, body);

        if (CREATE_NEWS) {
          const newsMessage = await createNewsMessage(subject, body)
            .catch(error);
          if (newsMessage) {
            debug('newsMessage created:', newsMessage.id);
          }
        }

      }

      return done();

    } catch (e) {
      error(e);
      return done(e);
    }
  }

}

/**
 * postGroupMessage
 * @param bot
 * @param subject
 * @param body
 * @returns {Promise<Message>}
 */

function postGroupMessage(bot, subject, body) {

  const msg = [
    `🔔 <b>${subject}</b>\n`,
    parseMessageBody(body),
  ];

  return bot.telegram.sendMessage(GROUP_CHAT_ID, msg.join('\n'), { parse_mode: 'HTML' });

}


/**
 * createNewsMessage
 * @param subject
 * @param body
 * @returns {Promise<Object>}
 */

function createNewsMessage(subject, body) {

  const today = serverDateFormat();

  const newsMessage = {
    subject,
    body: parseMessageBody(body),
    dateB: today,
    dateE: today,
    appVersion: '1.0',
  };

  return create('NewsMessage', false, newsMessage);

}

function parseMessageBody(body) {
  return Array.isArray(body) ? body.join('\n') : body;
}
