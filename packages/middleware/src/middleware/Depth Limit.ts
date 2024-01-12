// #region Developer Information
/*
 ********************************************
    Author: Andrew Laychak
    Email: ALaychak@harriscomputer.com

    Created At: 01-24-2022 01:29:35 PM
    Last Modified: 04-20-2023 11:05:24 PM
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
import type { ExtensionsData } from '../interfaces/All.js';
import type { FieldNode } from 'graphql';
import { GraphQLError } from 'graphql';
import _ from 'lodash';
import type { MiddlewareFn, ResolverData } from 'type-graphql';
// #endregion

// #region Check Depth
/**
 * Recursive function that continues until there are no more objects to check against. Once done, returns the final depth
 *
 * @param fValue - Object to check the depth of
 * @param cDepth - The current depth of the entire object
 */
function checkDepth(fValue: FieldNode, cDepth = 0): number {
  let fDepth = cDepth;

  if (_.get(fValue, 'selectionSet.selections') !== undefined) {
    fDepth += 1;

    fValue.selectionSet?.selections.forEach((sValue) => {
      const sValueFieldNode = sValue as FieldNode;
      fDepth = checkDepth(sValueFieldNode, fDepth);
    });
  }

  return fDepth;
}
// #endregion

// #region Depth Limit
/**
 * Used as a middleware to check the depth of a query against the depth value (defaults to 5). Anything over the depth value will throw an error. Helps prevent nested query attacks
 *
 * @param depth - The max depth that will be checked against
 */
// TODO: Revert back to 5
function DepthLimit(depth = 15): MiddlewareFn {
  return async ({ info }: ResolverData, next) => {
    let newDepth = depth;

    const { depthLimit } = info.parentType.getFields()[info.fieldName]
      .extensions as ExtensionsData;
    if (depthLimit !== undefined) {
      newDepth = depthLimit;
    }

    let mDepth = 1;
    info.fieldNodes.forEach((fValue: FieldNode) => {
      const fDepth = checkDepth(fValue);

      if (fDepth > mDepth) {
        mDepth = fDepth;
      }
    });

    if (mDepth > newDepth) {
      // message: `${info.fieldName} has a depth of ${mDepth}, which is over the max depth limit of ${depth}`,
      // type: info.operation.operation,
      // field: info.fieldName,

      throw new GraphQLError(
        `${info.fieldName} has a depth of ${mDepth}, which is over the max depth limit of ${newDepth}`,
        {
          extensions: {
            code: 'MAX_DEPTH_EXCEEDED',
          },
        }
      );
    }

    return next();
  };
}
// #endregion

// #region Exports
export default DepthLimit;
// #endregion
