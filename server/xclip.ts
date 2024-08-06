import { Express, Request, Response } from 'express';
import { exec, ExecException, spawn } from 'node:child_process';

/**
 * @property {string[]} Xclipboards valid xclip clipboards.
 */
// const Xclipboards = ['primary', 'secondary', 'clipboard'];
type Xclipboards = 'primary' | 'secondary' | 'clipboard';

/**
 * @property {string[]} MimeTypes valid mime types accepted this will handle.
 */
const MimeTypes = ['image/png', 'image/jpg', 'image/gif'];

/**
 * @class XclipClient
 * @description A simple client for the xclip utility.
 */
export class XclipClient {
    app: Express;

    constructor(app: Express) {
        this.app = app;
        this.app.get('/api/clip', (req, res) => this.getClipboard(req, res));
        this.app.get('/api/clip/:which', (req, res) => this.getClipboard(req, res));
        this.app.post('/api/clip/:which', (req, res) => this.setClipboard(req, res));
    }

    getClipboard(req: Request, res: Response): void {
        const which = <Xclipboards>req.params.which ?? 'primary';
        // use xclip to fetch what's on the clipboard.
        exec(`xclip -o -selection '${which}'`, (err: ExecException|null, stdout: string, stderr: string): void => {
            if (err) {
                res.send({status: 500, message: 'Error fetching clipboard', error: err});
            } else {
                console.log(`Clipboard contents: ${stdout}`);
                res.send({status: 200, message: 'Clipboard contents', clip: stdout});
            }
        });
    }
    
    setClipboard(req: Request, res: Response): void {
        const which = <Xclipboards>req.params.which ?? 'primary';
        const clip = req.body?.clip ?? '';
        const target = req.body?.target ?? 'text/plain';
        const display = process.env.DISPLAY;
        console.log(`Copying to ${which} clipboard on display ${display}`);
        console.debug(req);
        // use xclip to set the clipboard.
        try {
            const xargs = ['-l', '1', '-silent', '-selection', which];
            if ( MimeTypes.includes(target) ) {
                xargs.push('-t', target);
            }
            const xclip = spawn('xclip', xargs);
            xclip.stdin.write(Buffer.from(clip.toString(), 'utf8'));
            xclip.stdin.end();
            xclip.on('error', (err: ExecException) => {
                res.send({status: 500, message: 'Error setting clipboard', error: err});
            });
            xclip.unref();
            res.send({status: 200, message: 'Clipboard set', clip: clip, target, display, });
        } catch (e) {
            console.log(e);
            res.send({status: 500, message: 'Exception setting clipboard', error: e});
        }
    }
}
