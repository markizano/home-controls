#!/usr/bin/env ts-node

import { exec, ExecException, spawn } from 'node:child_process';
import express, { Request, Response } from 'express';
import { PaClient, Direction } from './paclient';

/**
 * @property {string[]} Xclipboards valid xclip clipboards.
 
 */
const Xclipboards = ['primary', 'secondary', 'clipboard'];

/**
 * @property {string[]} MimeTypes valid mime types accepted this will handle.
 */
const MimeTypes = ['image/png', 'image/jpg', 'image/gif'];

const app = express();
const pc = new PaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/volume', async (req, res) => {
    const sinks = await pc.client.getSinkList();
    const vols = sinks.map(sink => sink.channelVolume.volumes[0]);
    res.send({status: 200, message: 'Volume levels', volume: vols});
});

app.get('/volume/:direction', (req, res) => {
    const { direction } = req.params;
    pc.setVolume(direction as Direction).then((vols: number[]) => {
        res.send({status: 200, message: `Volume ${direction} with volumes: ${vols}`, volume: vols});
    });
    
});

app.get('/clip/:which', (req, res) => {
    const { which } = ((p) => Xclipboards.includes(p.which)? p: {'which': 'primary'})(req.params);
    // use xclip to fetch what's on the clipboard.
    exec(`xclip -o -selection '${which}'`, (err: ExecException|null, stdout: string, stderr: string): void => {
        if (err) {
            res.send({status: 500, message: 'Error fetching clipboard', error: err});
        } else {
            console.log(`Clipboard contents: ${stdout}`);
            res.send({status: 200, message: 'Clipboard contents', clip: stdout});
        }
    });
});

app.post('/clip/:which', (req: Request, res: Response) => {
    const which = ((p) => Xclipboards.includes(p.which)? p.which: 'primary')(req.params);
    const clip = req.body?.clip ?? '';
    const target = req.body?.target ?? 'text/plain';
    const display = process.env.DISPLAY;
    console.log(`Copying to ${which} clipboard on display ${display}`);
    console.debug(clip);
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
});

app.on('ready', () => {
    console.log('PulseAudio client is ready');
    app.listen(3000, async () => {
        console.log('Server is running on port 3000');
    });
});

(async () => {
    await pc.connect();
    app.emit('ready');
})();
