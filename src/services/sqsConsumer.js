import Consumer from 'sqs-consumer';
import log from 'sistemium-telegram/services/log';
import AWS from 'aws-sdk';

const { debug, error } = log('sqsConsumer');
const QUE_URL = 'https://sqs.eu-west-1.amazonaws.com/554658909973/g77Bot-dr50';

export default function init(bot) {

  const sqs = Consumer.create({
    queueUrl: QUE_URL,
    handleMessage,
    sqs: new AWS.SQS({ region: 'eu-west-1' }),
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
    }
  }
}
