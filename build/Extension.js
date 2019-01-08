"use strict";
/**
 * Extension.ts
 *
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const rotating_file_stream_1 = __importDefault(require("rotating-file-stream"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const morgan_1 = __importDefault(require("morgan"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const core_1 = require("@fastpanel/core");
const Const_1 = require("./Const");
/**
 * Create file stream instant.
 *
 * @param basePath
 */
function getLogsStream(basePath) {
    let logDirectory = path_1.default.join(basePath, 'Http');
    fs_1.default.existsSync(logDirectory) || fs_1.default.mkdirSync(logDirectory);
    return rotating_file_stream_1.default('Access.log', {
        interval: '1d',
        path: logDirectory
    });
}
;
/**
 * Class Extension
 *
 * Initialization of the extension.
 *
 * @version 1.0.0
 */
class Extension extends core_1.Extensions.ExtensionDefines {
    /**
     * Registers a service provider.
     */
    async register() {
        /* Check context. */
        if (this.context instanceof core_1.Worker.Handler) {
            /* Registration express server. */
            this.di.set('web', (di) => {
                /* Create server. */
                let web = express_1.default();
                /* Server configuration. */
                web.set('trust proxy', true);
                web.set('json spaces', ((this.config.get('Env.NODE_ENV', 'develop') !== 'production') ? 2 : false));
                /* Mount http\s request logger. */
                web.use(morgan_1.default('combined', {
                    stream: getLogsStream((process.env.LOGGER_PATH) ? process.env.LOGGER_PATH : 'App/Logs'),
                    skip: function (request, response) { return response.statusCode < 400; }
                }));
                /* Mount static files handler. */
                web.use(express_1.default.static('public'));
                /* Mount cross-origin resource sharing. */
                web.use(cors_1.default());
                /* Mount cookie parser. */
                web.use(cookie_parser_1.default());
                /* Mount ajax request parser. */
                web.use(body_parser_1.default.urlencoded({ extended: false }));
                /* Mount json request parser. */
                web.use(body_parser_1.default.json());
                return web;
            }, true);
            /* Registration http \ https server. */
            this.di.set('http', (di) => {
                /* Server container. */
                let server = null;
                /* SSL Files paths. */
                let sslKey = './ssl/' + this.config.get('Env.WEB_DOMAIN', this.config.get('Ext/Web.domain')) + '.key';
                let sslCert = './ssl/' + this.config.get('Env.WEB_DOMAIN', this.config.get('Ext/Web.domain')) + '.cert';
                /* Create server. */
                if (fs_1.default.existsSync(sslKey) && fs_1.default.existsSync(sslCert)) {
                    server = https_1.default.createServer({
                        key: fs_1.default.readFileSync(sslKey),
                        cert: fs_1.default.readFileSync(sslCert)
                    }, this.web);
                }
                else {
                    server = http_1.default.createServer(this.web);
                }
                return server;
            }, true);
        }
        /* Registered cli commands. */
        this.events.once('cli:getCommands', async (cli) => { });
        /* Install and configure the basic components of the system. */
        this.events.on('app:getSetupSubscriptions', (list) => {
            list.push(async (command, args) => {
                /* Check and create default config file. */
                if (!this.config.get('Ext/Web', false)) {
                    this.config.set('Ext/Web', Const_1.WEB_CONFIG);
                    this.config.save('Ext/Web', true);
                }
            });
        });
    }
    /**
     * Startup a service provider.
     */
    async startup() {
        /* Check context. */
        if (this.context instanceof core_1.Worker.Handler) {
            /* Fire event. */
            this.events.emit('web:getMiddleware', this.web);
            this.events.emit('web:getRoutes', this.web);
            /* Run server. */
            this.http.listen({
                port: this.config.get('Env.WEB_PORT', this.config.get('Ext/Web.port', 3000)),
                host: this.config.get('Env.WEB_HOST', this.config.get('Ext/Web.host', '127.0.0.1'))
            });
            /* Fire event. */
            this.events.emit('http:startup', this.http);
            this.events.emit('web:startup', this.web);
        }
    }
}
exports.Extension = Extension;
/* End of file Extension.ts */ 
