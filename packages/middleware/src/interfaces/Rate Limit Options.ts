// #region Developer Information
/*
 ********************************************
  Author: Andrew Laychak
  Email: ALaychak@HarrisComputer.com
  
  Created At: 04-20-2023 01:13:28 AM
  Last Modified: 04-20-2023 09:40:31 PM
  Last Updated By: Andrew Laychak
  
  Description: Interface that contains the options for the Rate Limit middleware
  
  References:
    - None
 ********************************************
*/
// #endregion

// #region Imports
import type { GraphQLError, GraphQLResolveInfo } from 'graphql';
import type RedisOptions from './Redis Options.js';
// #endregion

// #region Rate Limit - Options
interface RateLimitOptions {
  prefix?: string;
  message?: string;
  createError?: (
    info: GraphQLResolveInfo,
    window: string,
    max: number
  ) => GraphQLError;
  identifyContext?: <T>(x: T) => string;
  window?: string;
  max?: number;
  redis?: RedisOptions | string;
}
// #endregion

// #region Exports
export default RateLimitOptions;
// #endregion
