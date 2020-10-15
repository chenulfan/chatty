import redis from 'redis'
import bluebird from 'bluebird'

bluebird.promisifyAll(redis)

//  const redisClient = redis.createClient();
// const redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
const redisClient = redis.createClient(process.env.REDISCLOUD_URL);

export default redisClient

