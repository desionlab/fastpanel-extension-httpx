/**
 * index.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */

import { Extensions } from 'fastpanel-core';

module.exports = class extends Extensions.ExtensionDefines {

  /**
   * Registers a service provider.
   */
  async register () : Promise<any> {}
  
  /**
   * Startup a service provider.
   */
  async startup () : Promise<any> {}

}

/* End of file index.ts */