// #region Developer Information
/*
 ********************************************
  Author: Andrew Laychak
  Email: ALaychak@HarrisComputer.com
  
  Created At: 04-19-2023 11:02:57 PM
  Last Modified: 04-20-2023 01:43:17 AM
  Last Updated By: Andrew Laychak
  
  Description: Interface that contains the data for the Extensions decorator
  
  References:
    - None
 ********************************************
*/
// #endregion

// #region Extensions
interface ExtensionsData {
  depthLimit?: number;
  rateLimit?: {
    window?: string;
    max?: number;
  };
}
// #endregion

// #region Exports
export default ExtensionsData;
// #endregion
