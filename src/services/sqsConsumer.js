import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import { SQS } from 'aws-sdk';

const { debug, error } = log('sqsConsumer');
const { QUE_URL } = process.env;

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

      const { userId, message } = JSON.parse(msg.Body);
      await bot.telegram.sendMessage(userId, message);

      done();

    } catch (e) {
      error(e);
      done(e);
    }
  }

}
