// #region Developer Information
/*
 ********************************************
  Author: Andrew Laychak
  Email: ALaychak@HarrisComputer.com
  
  Created At: 04-20-2023 09:32:22 PM
  Last Modified: 04-20-2023 11:05:31 PM
  Last Updated By: Andrew Laychak
  
  Description: 
  
  References:
    - None
 ********************************************
*/
// #endregion
// #region Developer Information
/*
 ********************************************
    Author: Andrew Laychak
    Email: ALaychak@harriscomputer.com

    Created At: 01-24-2022 01:29:35 PM
    Last Modified: 04-20-2023 09:32:20 PM
    Last Updated By: Andrew Laychak

    Description: Middleware that allows specific resolvers to have a depth limit and will throw an error if the depth is too much

    References:
      - https://regex101.com/r/ba3rAZ/1
      - https://www.npmjs.com/package/flat
      - https://codesandbox.io/s/funny-sunset-yoggv?file=/src/index.js:0-15208
 ********************************************
*/
// #endregion

// #region Imports
import type { MiddlewareFn, ResolverData } from 'type-graphql';
import NodeCache from 'node-cache';
import type { ExtensionsData, RateLimitOptions } from '../interfaces/All.js';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import ip from 'ip';
import { Redis } from 'ioredis';
// #endregion

// #region Node IP - Expands
const { address } = ip;
// #endregion

// #region Initial Cache
const cache = new NodeCache();
// #endregion

// #region Rate Limit
/**
 * Used as a middleware to limit the amount of queries that can be done within a certain time (defaults to 5 of the *same* query in 30 seconds). Anything over the depth value will throw an error. Helps prevent denial of service attacks
 *
 * @param window - The max depth that will be checked against
 * @param max - The max depth that will be checked against
 */
function RateLimit<T>(options?: RateLimitOptions): MiddlewareFn {
  return async ({ context, info }: ResolverData, next) => {
    const {
      createError,
      identifyContext,
      message = `Rate limit exceeded for ${info.fieldName}`,
      prefix = 'rate_limit',
      window = '2m',
      max = 15,
      redis,
    } = options ?? {};

    let redisClient: Redis | undefined;
    let isRedis = false;
    if (redis !== undefined) {
      let redisUrl = '';
      if (typeof redis === 'string') {
        redisUrl = redis;
      } else {
        const { connection, ioRedis } = redis;

        if (connection) {
          const redisUsername = connection.username ?? 'default';
          const redisPassword = connection.password ?? '';
          const redisDomain = connection.domain ?? 'localhost';
          const redisPort = connection.port ?? 6379;

          redisUrl = `redis://${redisUsername}:${redisPassword}@${redisDomain}:${redisPort}`;
        }

        let ioRedisOptions = {};
        if (ioRedis) {
          ioRedisOptions = ioRedis;
        }

        redisClient = new Redis(redisUrl, ioRedisOptions);
        isRedis = true;
      }
    }

    const { rateLimit } = info.parentType.getFields()[info.fieldName]
      .extensions as ExtensionsData;

    let finalWindow = window;
    let finalMax = max;
    if (rateLimit !== undefined) {
      const { window: rateLimitWindow, max: rateLimitMax } = rateLimit;
      finalWindow = rateLimitWindow ?? finalWindow;
      finalMax = rateLimitMax ?? finalMax;
    }

    const windowSeconds = ms(finalWindow) / 1000;

    const fieldNameKey = info.fieldName;

    let user = address();
    if (identifyContext !== undefined) {
      user = identifyContext(context as T);
    }
    console.log('USER: ', user);

    const uniqueKey = `${prefix}:${user}:${fieldNameKey}`;

    let keys: number[] | string[] | undefined;
    if (isRedis) {
      const redisKeys = await redisClient?.lrange(
        `${prefix}:${user}:${fieldNameKey}`,
        0,
        -1
      );

      keys = redisKeys;
    } else {
      keys = cache.get<number[]>(uniqueKey);
    }

    if (keys && keys.length >= finalMax) {
      if (createError !== undefined) {
        return createError(info, finalWindow, finalMax);
      } else {
        throw new GraphQLError(message, {
          extensions: {
            code: 'RATE_LIMIT_EXCEEDED',
          },
        });
      }
    }

    const timestamp = Date.now();

    if (isRedis) {
      await redisClient?.lpush(uniqueKey, timestamp);
      await redisClient?.expire(uniqueKey, windowSeconds);
    } else {
      if (keys && keys.length > 0) {
        cache.set(uniqueKey, [...keys, timestamp], windowSeconds);
      } else {
        cache.set(uniqueKey, [timestamp], windowSeconds);
      }
    }

    return next();
  };
}
// #endregion

// #region Exports
export default RateLimit;
// #endregion
