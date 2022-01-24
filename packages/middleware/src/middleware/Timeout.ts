// #region ESLint Rules
/* eslint-disable no-promise-executor-return */
// #endregion

// #region Developer Information
/*
 ********************************************
    Author: Andrew Laychak
    Email: ALaychak@harriscomputer.com

    Created At: 01-24-2022 01:29:43 PM
    Last Modified: 01-24-2022 01:29:50 PM
    Last Updated By: Andrew Laychak

    Description: Middleware that allows specific resolvers to time-out after a specific amount of time

    References:
      - https://typegraphql.com/docs/middlewares.html
 ********************************************
*/
// #endregion

// #region Imports
import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
// #endregion

// #region Timeout
/**
 * Will throw an error when a query takes longer than the time specified by the timeout value.
 *
 * @param timeout - The max time to wait for the result before an error is thrown (in milliseconds). Defaults to 15 seconds
 */
function Timeout(timeout = 180000): MiddlewareFn {
  return async ({ info }, next) => {
    const tSecondsMessage = timeout / 1000 === 1 ? 'second' : 'seconds';

    return Promise.race([
      next(),
      new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new ApolloError('Timeout', 'TO1', {
                message: `${info.fieldName} has timed out after ${
                  timeout / 1000
                } ${tSecondsMessage}`,
                type: info.operation.operation,
                field: info.fieldName,
              })
            ),
          timeout
        )
      ),
    ]);
  };
}
// #endregion

// #region Exports
export default Timeout;
// #endregion
