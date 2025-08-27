import Redis from 'ioredis'
import { envServer } from '@/data/env/envServer'

async function establishRedis() {
  const redis = new Redis({
    host: envServer.REDIS_HOST,
    port: envServer.REDIS_PORT,
  })
  process.once('SIGINT', () => {
    redis.quit()
    console.info('Redis connection closed.')
  })
  process.once('SIGTERM', () => {
    redis.quit()
    console.info('Redis connection closed.')
  })

  try {
    const result = await redis.ping()
    if (result === 'PONG') {
      console.info('Redis connected successfully.')
    }
  } catch (error) {
    // const message = formatErrorMessage(
    //   '@/lib/redis/index.ts redisPing()',
    //   'Redis connection failed.',
    //   error
    // )
    // console.error(message)

    console.error(error) // NEEDS FIXING
    process.exit(1)
  }

  return redis
}

export const redis = envServer.IS_NOT_BUILD_TIME
  ? await establishRedis()
  : ({} as Redis)
