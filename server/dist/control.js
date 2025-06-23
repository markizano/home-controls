"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlsClient = void 0;
const node_child_process_1 = require("node:child_process");
/**
 * @property {string[]} MimeTypes valid mime types accepted this will handle.
 */
const MimeTypes = ['image/png', 'image/jpg', 'image/gif'];
/**
 * @class XclipClient
 * @description A simple client for the xclip utility.
 */
class ControlsClient {
    constructor(app) {
        this.app = app;
        this.app.get('/api/sleepDisplay', (req, res) => this.sleepDisplay(req, res));
    }
    sleepDisplay(req, res) {
        (0, node_child_process_1.exec)(`xset dpms force suspend`, (err, stdout, stderr) => {
            if (err) {
                res.send({ status: 500, message: 'Error turning off display', error: err });
            }
            else {
                console.log(`Sleep display. Nite nite.`);
                res.send({ status: 200, message: 'Putting display to 💤💤... nite nite' });
            }
        });
    }
}
exports.ControlsClient = ControlsClient;
