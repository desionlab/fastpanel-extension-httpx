/**
 * Setup.js
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2019 Desionlab
 * @license   MIT
 */

import { EOL } from 'os';
import Winston from 'winston';
import { Cli } from '@fastpanel/core';
import { WEB_CONFIG } from '../Const';

/**
 * Class Setup
 * 
 * @version 1.0.0
 */
export class Setup extends Cli.CommandDefines {
  
  /**
   * Initialize a commands provider.
   */
  public initialize () {
    this.cli
    .command('fastpanel/http setup', 'Configure http components.')
    .option('-e, --env', 'Save as current environment settings.')
    .option('-f, --force', 'Forced reconfiguration of components.')
    .visible(false)
    .action((args: {[k: string]: any}, options: {[k: string]: any}, logger: Winston.Logger) => {
      return new Promise(async (resolve, reject) => {
        /* Info message. */
        logger.info(`${EOL}Configure http components.`);

        if (!this.config.get('Ext/Web', false) || options.force) {
          /* Prompts list. */
          let questions = [
            /* Host. */
            {
              type: 'input',
              name: 'host',
              message: 'Host (IP) for HTTP server?',
              default: this.config.get('Ext/Web.host', WEB_CONFIG.host)
            },
            /* Port. */
            {
              type: 'input',
              name: 'port',
              message: 'Port for HTTP server?',
              default: this.config.get('Ext/Web.port', WEB_CONFIG.port)
            },
            /* Domain. */
            {
              type: 'input',
              name: 'domain',
              message: 'Domain name for http server?',
              default: this.config.get('Ext/Web.domain', WEB_CONFIG.domain)
            }
          ];
          
          /* Show prompts to user. */
          let config = await this.prompt(questions);
          
          /* Save data. */
          this.config.set('Ext/Web', config);
          this.config.save('Ext/Web', !(options.env));

          /* Info message. */
          logger.info(`${EOL}Applied:`);
          logger.info('', this.config.get('Ext/Web'));
        } else {
          /* Info message. */
          logger.info(` Everything is already configured. ${EOL}`);
        }

        /* Command complete. */
        resolve();
      });
    });
  }

}

/* End of file Setup.js */