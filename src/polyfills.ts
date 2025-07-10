import 'zone.js';  // Included with Angular CLI.

/***************************************************************************************************
 * APPLICATION IMPORTS
 */

// Si necesitas polyfills para ExcelJS y stream-browserify, agrega:
(window as any).global = window;
(window as any).Stream = require('stream-browserify').Stream;