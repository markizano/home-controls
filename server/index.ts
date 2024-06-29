#!/usr/bin/env ts-node

import { exec, ExecException, spawn } from 'node:child_process';
import express from 'express';
import { PaClient, Direction } from './paclient';

const Xclipboards = ['primary', 'secondary', 'clipboard'];

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
            res.send({status: 200, message: 'Clipboard contents', clip: stdout});
        }
    });
});

app.post('/clip/:which', (req, res) => {
    const { which } = req.params;
    const { clip } = req.body;
    // use xclip to set the clipboard.
    const xclip = spawn(`xclip -l 1 -selection '${which}'`);
    xclip.stdin.write(clip);
    xclip.stdin.end();
    xclip.on('close', (code: number, signal: string) => {
        res.send({status: 200, message: 'Clipboard set'});
    });
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
