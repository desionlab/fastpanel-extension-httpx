/**
 * index.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */

import { Di, Extensions } from 'fastpanel-core';

module.exports = class extends Extensions.ExtensionDefines {

  /**
   * Registers a service provider.
   */
  async register (di: Di.Container) : Promise<any> {}
  
  /**
   * Startup a service provider.
   */
  async startup (di: Di.Container) : Promise<any> {}

}

/* End of file index.ts */