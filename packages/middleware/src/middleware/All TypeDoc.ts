// #region Developer Information
/*
 ********************************************
    Author: Andrew Laychak
    Email: ALaychak@harriscomputer.com

    Created At: 01-24-2022 01:29:19 PM
    Last Modified: 01-24-2022 01:29:21 PM
    Last Updated By: Andrew Laychak

    Description: Helper file that contains all the middlware functions, making it easier to import specific middleware functions.

    References:
      - None
 ********************************************
*/
// #endregion

// #region Module Information
// All.ts
/**
 * Contains all the various middlewares for the GraphQL schema
 *
 * @packageDocumentation
 * @module Schema Middlewares
 */
// #endregion

// #region Imports
import * as Timeout from './Timeout';
import * as DepthLimit from './Depth Limit';
// #endregion

// #region Exports
export { Timeout, DepthLimit };
// #endregion
