(async () => {
  try {
    const { Kafka } = require('kafkajs');
    const kafka = new Kafka({
      clientId: 'tmp-consumer',
      brokers: ['kafka:9092'],
    });
    const consumer = kafka.consumer({ groupId: 'tmp-consumer-' + Date.now() });

    await consumer.connect();
    await consumer.subscribe({ topic: 'order_created', fromBeginning: true });
    console.log('Subscribed to order_created — listening 10s...');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const txt = message.value ? message.value.toString() : '<empty>';
          console.log('MSG', txt);
        } catch (e) {
          console.error('PARSE_ERR', e);
        }
      },
    });

    setTimeout(async () => {
      try {
        await consumer.disconnect();
      } catch (e) {
        /* ignore */
      }
      console.log('Consumer exiting');
      process.exit(0);
    }, 10000);
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  }
})();
