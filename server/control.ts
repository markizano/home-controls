import { Express, Request, Response } from 'express';
import { exec, ExecException } from 'node:child_process';

/**
 * @class XclipClient
 * @description A simple client for the xclip utility.
 */
export class ControlsClient {
    app: Express;

    constructor(app: Express) {
        this.app = app;
        this.app.get('/api/sleepDisplay', (req, res) => this.sleepDisplay(req, res));
    }

    sleepDisplay(req: Request, res: Response): void {
        exec(`xset dpms force suspend`, (err: ExecException|null, stdout: string, stderr: string): void => {
            if (err) {
                res.send({status: 500, message: 'Error turning off display', error: err});
            } else {
                console.log(`Sleep display. Nite nite.`);
                res.send({status: 200, message: 'Putting display to 💤💤... nite nite'});
            }
        });
    }
}
