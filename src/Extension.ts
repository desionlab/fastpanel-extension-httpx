/**
 * Extension.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */

import fs from 'fs';
import fsr from 'rotating-file-stream';
import path from 'path';
import http from 'http';
import https from 'https';
import morgan from 'morgan';
import Vorpal from 'vorpal';
import Express from 'express';
import ExpressBodyParser from 'body-parser';
import ExpressCookieParser from 'cookie-parser';
import ExpressCors from 'cors';
import { Di, Extensions, Cluster } from '@fastpanel/core';
import { SetupTaskDefinesMethod } from '@fastpanel/core/build/Commands';

/**
 * Create file stream instant.
 * 
 * @param basePath 
 */
function getLogsStream (basePath: string) {
  let logDirectory = path.join(basePath, 'Http');
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
  
  return fsr('Access.log', {
    interval: '1d',
    path: logDirectory
  });
};

/**
 * Class Extension
 * 
 * Initialization of the extension.
 * 
 * @version 1.0.0
 */
export class Extension extends Extensions.ExtensionDefines {

  /**
   * Registers a service provider.
   */
  async register () : Promise<any> {
    /* Check context. */
    if (this.context instanceof Cluster.Handler) {
      /* Registration express server. */
      this.di.set('web', (di: Di.Container) => {
        /* Create server. */
        let web = Express();
        
        /* Server configuration. */
        web.set('trust proxy', true);
        web.set('json spaces', ((this.config.get('Env.NODE_ENV', 'develop') !== 'production') ? 2 : false));
        
        /* Mount http\s request logger. */
        web.use(morgan('combined', {
          stream: getLogsStream((process.env.LOGGER_PATH) ? process.env.LOGGER_PATH : 'App/Logs'),
          skip: function (request, response) { return response.statusCode < 400 }
        }));
        
        /* Mount static files handler. */
        web.use(Express.static('public'));
        
        /* Mount cross-origin resource sharing. */
        web.use(ExpressCors());

        /* Mount cookie parser. */
        web.use(ExpressCookieParser());
        
        /* Mount ajax request parser. */
        web.use(ExpressBodyParser.urlencoded({ extended: false }));

        /* Mount json request parser. */
        web.use(ExpressBodyParser.json());
        
        return web;
      }, true);

      /* Registration http \ https server. */
      this.di.set('http', (di: Di.Container) => {
        /* Server container. */
        let server = null;
        
        /* SSL Files paths. */
        let sslKey  = './ssl/' + this.config.get('Extensions/Web.domain') + '.key';
        let sslCert = './ssl/' + this.config.get('Extensions/Web.domain') + '.cert';
        
        /* Create server. */
        if (fs.existsSync(sslKey) && fs.existsSync(sslCert)) {
          server = https.createServer({
            key: fs.readFileSync(sslKey),
            cert: fs.readFileSync(sslCert)
          }, this.web);
        } else {
          server = http.createServer(this.web);
        }

        return server;
      }, true);
    }
    
    /* Install and configure the basic components of the system. */
    this.events.on('app:getSetupTasks', async (list: Array<SetupTaskDefinesMethod>) => {
      list.push(async (command: Vorpal.CommandInstance, args?: any) => {});
    });
    
    /* Registered cli commands. */
    this.events.once('cli:getCommands', async (cli: Vorpal) => {});
  }
  
  /**
   * Startup a service provider.
   */
  async startup () : Promise<any> {
    /* Check context. */
    if (this.context instanceof Cluster.Handler) {
      /* Fire event. */
      this.events.emit('web:getMiddleware', this.web);
      this.events.emit('web:getRoutes', this.web);

      /* Run server. */
      this.http.listen({
        port: this.config.get('Extensions/Web.port', this.config.get('Env.PORT', 3000)),
        host: this.config.get('Extensions/Web.host', this.config.get('Env.HOST', '127.0.0.1'))
      });

      /* Fire event. */
      this.events.emit('http:startup', this.http);
      this.events.emit('web:startup', this.web);
    }
  }

}

/* End of file Extension.ts */