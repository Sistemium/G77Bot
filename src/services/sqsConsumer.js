import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import bot from 'sistemium-telegram/services/bot';
import { SQS } from 'aws-sdk';
import { eachSeriesAsync } from 'sistemium-telegram/services/async';

import map from 'lodash/map';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import * as usersDb from './users';
import { userSettings, subscriptionSettings } from './userSettings';
import { isNotifyTime } from './moments';
import * as queuesDb from '../store/queues';

const { debug, error } = log('sqsConsumer');

const { telegram } = bot;

/**
 * SqsConsumer static storage
 * @type {Object.<String,SqsConsumer>}}
 */
const consumers = {};


class SqsConsumer {

  constructor(config) {

    this.groupChatId = config.groupChatId;
    this.queueUrl = config.queueUrl;

    this.sqs = Consumer.create({
      queueUrl: config.queueUrl,
      handleMessage: (msg, done) => this.messageHandler(msg, done),
      sqs: new SQS({ region: 'eu-west-1' }),
    });

    this.sqs.on('error', error);
    this.sqs.on('processing_error', error);
    this.sqs.on('stopped', () => {
      debug('stopped', this.groupChatId);
    });

    this.sqs.start();

    debug('started', this.groupChatId);

  }

  remove() {
    this.sqs.stop();
  }

  async generateUserArray(org, messageType, authId, salesman) {

    if (!subscriptionSettings(org)[messageType]) {
      return [this.groupChatId];
    }

    const allOrgUsers = await usersDb.findAll(org);

    const result = filter(allOrgUsers, user => {
      if (authId && user.authId === authId) {
        return true;
      }
      if (salesman && user.salesman === salesman) {
        return true;
      }
      if (Array.isArray(user.salesman)) {
        return user.salesman.indexOf(salesman) >= 0;
      }
      return !salesman && !authId;
    });

    if (authId && !result.length) {
      debug(`no user with authID: ${authId}`);
    }

    if (salesman && !result.length) {
      debug(`no user with salesman: ${salesman}`);
    }

    return map(result, 'id');

  }

  async messageHandler(msg, done) {

    const { queueUrl } = this;

    debug('got message');

    try {

      const payload = JSON.parse(msg.Body);
      const org = queueUrl.match('[^-]*$');
      const {
        messageType,
        message,
        mediaGroup,
        subject,
        body,
        userId,
        authId,
        salesman,
      } = payload;

      const allUsers = userId ? [userId] : await this.generateUserArray(
        org,
        messageType,
        authId,
        salesman,
      );

      debug(allUsers);
      const users = await filterUsers(allUsers, messageType);

      await postMessage(users, {
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


export async function setupSqsConsumers() {

  const queues = await queuesDb.findAll();

  forEach(queues, queue => {

    consumers[queue.id] = new SqsConsumer({
      groupChatId: queue.id,
      queueUrl: queue.url,
    });

  });

}

export function addSqsConsumer(groupChatId, queueUrl) {

  consumers[groupChatId] = new SqsConsumer({ groupChatId, queueUrl });

}

export function removeSqsConsumer(groupChatId) {

  const consumer = consumers[groupChatId];

  if (consumer) {
    delete consumers[groupChatId];
    consumer.remove();
  }

}


async function postMessage(ids, options) {

  const {
    message, mediaGroup, subject, body,
  } = options;

  const opts = {
    disable_notification: !isNotifyTime(),
    parse_mode: 'HTML',
  };

  await eachSeriesAsync(ids, async id => {

    if (mediaGroup) {

      await telegram.sendMessage(id, `${subjectEmoji(subject)} <b>${subject}</b>`, opts);

      const msg = map(mediaGroup, ({ src }) => ({
        media: src,
        type: 'photo',
      }));

      await telegram.sendMediaGroup(id, msg, opts);

    } else {

      const msg = message || [
        `${subjectEmoji(subject)} <b>${subject}</b>\n`,
        parseMessageBody(body),
      ].join('\n');

      await telegram.sendMessage(id, msg, opts)
        .catch(error);

    }

  });

}

async function filterUsers(users, messageType) {

  if (!messageType || !users.length) {
    return users;
  }

  const res = [];

  await eachSeriesAsync(users, async id => {

    const userSetting = await userSettings(id, messageType);

    if (userSetting) {
      res.push(id);
    } else {
      debug('ignored messageType:', messageType, 'for userId:', id);
    }

  });

  return res;

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
