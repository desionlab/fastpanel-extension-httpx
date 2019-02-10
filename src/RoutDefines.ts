/**
 * RoutDefines.ts
 * 
 * @author    Desionlab <fenixphp@gmail.com>
 * @copyright 2014 - 2019 Desionlab
 * @license   MIT
 */

import { Di } from '@fastpanel/core';
import { Router } from 'express';
import { IRouter } from 'express-serve-static-core';

/**
 * Class RoutDefines
 * 
 * Controller abstract class.
 * 
 * @version 1.0.0
 */
export class RoutDefines extends Di.Injectable {
  
  /**
   * 
   */
  protected router: IRouter = Router();

  /**
   * RoutDefines constructor.
   * 
   * @param di Di container instant.
   */
  public constructor (di?: Di.Container) {
    super(di);
  }

  /**
   * Initialize routes.
   */
  public initialize () {}

}

/* End of file RoutDefines.ts */