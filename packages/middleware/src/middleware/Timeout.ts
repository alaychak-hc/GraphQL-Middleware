// #region Developer Information
/*
 ********************************************
  Author: Andrew Laychak
  Email: ALaychak@HarrisComputer.com
  
  Created At: 04-20-2023 09:50:51 PM
  Last Modified: 04-20-2023 10:03:03 PM
  Last Updated By: Andrew Laychak
  
  Description: Middleware that allows specific resolvers to time-out after a specific amount of time

  References:
    - https://typegraphql.com/docs/middlewares.html
 ********************************************
*/
// #endregion

// #region Imports
import type { ExtensionsData } from '@interfaces/All.js';
import { GraphQLError } from 'graphql';
import ms from 'ms';
import type { MiddlewareFn, ResolverData } from 'type-graphql';
import prettyMilliseconds from 'pretty-ms';
// #endregion

// #region Timeout
/**
 * Will throw an error when a query takes longer than the time specified by the timeout value.
 *
 * @param timeout - The max time to wait for the result before an error is thrown (in milliseconds). Defaults to 3 minutes
 */
function Timeout(timeout = '3m'): MiddlewareFn {
  return async ({ info }: ResolverData, next) => {
    const { timeout: newTimeout } = info.parentType.getFields()[info.fieldName]
      .extensions as ExtensionsData;

    const finalTimeout = newTimeout ?? timeout;
    const finalTimeoutMilliseconds = ms(finalTimeout);

    return Promise.race([
      next(),
      new Promise((_, reject) =>
        setTimeout(() => {
          reject(
            new GraphQLError(
              `${info.fieldName} has timed out after ${prettyMilliseconds(
                finalTimeoutMilliseconds,
                {
                  verbose: true,
                }
              )}`,
              {
                extensions: {
                  code: 'TIMEOUT_EXCEEDED',
                },
              }
            )
          );
        }, finalTimeoutMilliseconds)
      ),
    ]);
  };
}
// #endregion

// #region Exports
export default Timeout;
// #endregion
