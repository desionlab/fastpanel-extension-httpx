/**
 * Extension.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2019 Desionlab
 * @license   MIT
 */

import fs from 'fs';
import fsr from 'rotating-file-stream';
import path from 'path';
import http from 'http';
import https from 'https';
import morgan from 'morgan';
import Caporal from 'caporal';
import Express from 'express';
import ExpressBodyParser from 'body-parser';
import ExpressCookieParser from 'cookie-parser';
import ExpressCors from 'cors';
import { Di, Extensions, Worker } from '@fastpanel/core';
import { WEB_CONFIG } from './Const';

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
    /* Check config. */
    if (!this.config.get('Ext/Web', false) &&
      !this.config.get('Env.WEB_PORT', false)) {
        this.logger.warn('Component "HTTP/S" is not configured correctly!');
    }

    /* Check context. */
    if (this.context instanceof Worker.Handler) {
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
        web.use(Express.static('./public'));
        
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
        let sslKey  = './ssl/' + this.config.get('Env.WEB_DOMAIN',
          this.config.get('Ext/Web.domain', WEB_CONFIG.domain)) + '.key';
        let sslCert = './ssl/' + this.config.get('Env.WEB_DOMAIN',
          this.config.get('Ext/Web.domain', WEB_CONFIG.domain)) + '.cert';
        
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
    
    /* Registered cli commands. */
    this.events.once('cli:getCommands', (cli: Caporal) => {
      const { Setup } = require('./Commands/Setup');
      (new Setup(this.di)).initialize();
    });
  }
  
  /**
   * Startup a service provider.
   */
  async startup () : Promise<any> {
    /* Check context. */
    if (this.context instanceof Worker.Handler) {
      /* Fire event. */
      this.events.emit('web:getMiddleware', this.web);
      this.events.emit('web:getRoutes', this.web);

      /* Run server. */
      this.http.listen({
        port: this.config.get('Env.WEB_PORT',
          this.config.get('Ext/Web.port', WEB_CONFIG.port)),
        host: this.config.get('Env.WEB_HOST',
          this.config.get('Ext/Web.host', WEB_CONFIG.host))
      });

      /* Fire event. */
      this.events.emit('http:startup', this.http);
      this.events.emit('web:startup', this.web);
    }
  }

}

/* End of file Extension.ts */