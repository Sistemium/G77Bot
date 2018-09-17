import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import { SQS, config } from 'aws-sdk';

import { create } from './api';
import { serverDateFormat, isNotifyTime } from './moments';

const { debug, error } = log('sqsConsumer');
const { QUE_URL, GROUP_CHAT_ID, CREATE_NEWS } = process.env;
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
  config.update({ accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY });
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

      const { userId, message } = payload;
      const { subject, body } = payload;

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

      done();

    } catch (e) {
      error(e);
      done(e);
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
    `${subjectEmoji(subject)} <b>${subject}</b>\n`,
    parseMessageBody(body),
  ];

  const options = {
    parse_mode: 'HTML',
    disable_notification: !isNotifyTime(),
  };

  return bot.telegram.sendMessage(GROUP_CHAT_ID, msg.join('\n'), options);

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
  return Array.isArray(body) ? formatList(body) : body;
}

function formatList(arr) {

  return arr.map(str => `• ${str}`).join('\n');

}


function subjectEmoji(subject) {

  switch (subject) {
    case 'Новые товары на складе':
      return '🌟';
    case 'Больше нет на складе':
      return '⚠️';
    default:
      return '🔔';
  }

}
