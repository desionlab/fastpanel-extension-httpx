"use strict";
/**
 * RoutDefines.ts
 *
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2018 Desionlab
 * @license   MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@fastpanel/core");
const express_1 = require("express");
/**
 * Class RoutDefines
 *
 * Command abstract class.
 *
 * @version 1.0.0
 */
class RoutDefines extends core_1.Di.Injectable {
    /**
     * RoutDefines constructor.
     *
     * @param di Di container instant.
     */
    constructor(di) {
        super(di);
        /**
         *
         */
        this.router = express_1.Router();
    }
    /**
     * Initialize routes.
     */
    initialize() { }
}
exports.RoutDefines = RoutDefines;
/* End of file RoutDefines.ts */ 
