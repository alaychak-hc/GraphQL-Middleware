// #region Developer Information
/*
 ********************************************
    Author: Andrew Laychak
    Email: ALaychak@harriscomputer.com

    Created At: 06-30-2022 12:53:35 PM
    Last Modified: 09-01-2022 12:53:51 PM
    Last Updated By: Andrew Laychak

    Description: Interface for the Redis Options (in the package.json file)

    References:
      - None
 ********************************************
*/
// #endregion

// #region Imports
import type { RedisOptions as IoRedisOptions } from 'ioredis';
// #endregion

// #region Redis Options
interface RedisOptionsConnection {
  username?: string;
  password?: string;
  domain?: string;
  port?: number;
}

interface RedisOptions {
  connection?: RedisOptionsConnection;
  ioRedis?: IoRedisOptions;
}
// #endregion

// #region Exports
export default RedisOptions;
// #endregion
