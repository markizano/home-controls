"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XclipClient = void 0;
const node_child_process_1 = require("node:child_process");
/**
 * @property {string[]} MimeTypes valid mime types accepted this will handle.
 */
const MimeTypes = ['image/png', 'image/jpg', 'image/gif'];
/**
 * @class XclipClient
 * @description A simple client for the xclip utility.
 */
class XclipClient {
    constructor(app) {
        this.app = app;
        this.app.get('/api/clip', (req, res) => this.getClipboard(req, res));
        this.app.get('/api/clip/:which', (req, res) => this.getClipboard(req, res));
        this.app.post('/api/clip/:which', (req, res) => this.setClipboard(req, res));
    }
    getClipboard(req, res) {
        var _a;
        const which = (_a = req.params.which) !== null && _a !== void 0 ? _a : 'clipboard';
        // use xclip to fetch what's on the clipboard.
        (0, node_child_process_1.exec)(`xclip -o -selection '${which}'`, (err, stdout, stderr) => {
            if (err) {
                res.send({ status: 500, message: 'Error fetching clipboard', error: err });
            }
            else {
                console.log(`Clipboard contents: ${stdout}`);
                res.send({ status: 200, message: 'Clipboard contents', clip: stdout });
            }
        });
    }
    setClipboard(req, res) {
        var _a, _b, _c, _d, _e;
        const which = (_a = req.params.which) !== null && _a !== void 0 ? _a : 'clipboard';
        const clip = (_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.clip) !== null && _c !== void 0 ? _c : '';
        const target = (_e = (_d = req.body) === null || _d === void 0 ? void 0 : _d.target) !== null && _e !== void 0 ? _e : 'text/plain';
        const display = process.env.DISPLAY;
        console.log(`Copying to ${which} clipboard on display ${display}`);
        console.debug(req.body);
        // use xclip to set the clipboard.
        try {
            const xargs = ['-l', '1', '-selection', which];
            if (MimeTypes.includes(target)) {
                xargs.push('-t', target);
            }
            const xclip = (0, node_child_process_1.spawn)('xclip', xargs);
            xclip.stdin.write(Buffer.from(clip.toString(), 'utf8'));
            xclip.stdin.end();
            xclip.on('error', (err) => {
                res.send({ status: 500, message: 'Error setting clipboard', error: err });
            });
            xclip.unref();
            res.send({ status: 200, message: 'Clipboard set', clip: clip, target, display, });
            console.log(`Clipboard set to: ${clip}`);
        }
        catch (e) {
            console.error(e);
            res.send({ status: 500, message: 'Exception setting clipboard', error: e });
        }
    }
}
exports.XclipClient = XclipClient;
