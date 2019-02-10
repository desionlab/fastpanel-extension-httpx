"use strict";
/**
 * Setup.js
 *
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2019 Desionlab
 * @license   MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const core_1 = require("@fastpanel/core");
const Const_1 = require("../Const");
/**
 * Class Setup
 *
 * @version 1.0.0
 */
class Setup extends core_1.Cli.CommandDefines {
    /**
     * Initialize a commands provider.
     */
    initialize() {
        this.cli
            .command('fastpanel/http setup', 'Configure http components.')
            .option('-e, --env', 'Save as current environment settings.')
            .option('-f, --force', 'Forced reconfiguration of components.')
            .visible(false)
            .action((args, options, logger) => {
            return new Promise(async (resolve, reject) => {
                /* Info message. */
                logger.info(`${os_1.EOL}Configure http components.`);
                if (!this.config.get('Ext/Web', false) || options.force) {
                    /* Prompts list. */
                    let questions = [
                        /* Host. */
                        {
                            type: 'input',
                            name: 'host',
                            message: 'Host (IP) for HTTP server?',
                            default: this.config.get('Ext/Web.host', Const_1.WEB_CONFIG.host)
                        },
                        /* Port. */
                        {
                            type: 'input',
                            name: 'port',
                            message: 'Port for HTTP server?',
                            default: this.config.get('Ext/Web.port', Const_1.WEB_CONFIG.port)
                        },
                        /* Domain. */
                        {
                            type: 'input',
                            name: 'domain',
                            message: 'Domain name for http server?',
                            default: this.config.get('Ext/Web.domain', Const_1.WEB_CONFIG.domain)
                        }
                    ];
                    /* Show prompts to user. */
                    let config = await this.prompt(questions);
                    /* Save data. */
                    this.config.set('Ext/Web', config);
                    this.config.save('Ext/Web', !(options.env));
                    /* Info message. */
                    logger.info(`${os_1.EOL}Applied:`);
                    logger.info('', this.config.get('Ext/Web'));
                }
                else {
                    /* Info message. */
                    logger.info(` Everything is already configured. ${os_1.EOL}`);
                }
                /* Command complete. */
                resolve();
            });
        });
    }
}
exports.Setup = Setup;
/* End of file Setup.js */ 
