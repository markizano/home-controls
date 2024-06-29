#!/usr/bin/env ts-node
import { exec, ExecException, spawn } from 'node:child_process';

const which = 'primary';
const clip = process.stdin.read() ?? 'testing command input.';
const target = 'text/plain';
const display = process.env['DISPLAY'];
console.log(`Copying ${clip} to ${which} clipboard on display ${display}`);
// use xclip to set the clipboard.
try {
    const xargs = ['-l', '1', '-selection', which];
    xargs.push('-t', target);
    const xclip = spawn('xclip', xargs);
    xclip.on('error', (err: ExecException) => {
        console.error({status: 500, message: 'Error setting clipboard', error: err});
    });
    xclip.stdin.end(Buffer.from(clip, 'utf8'));
    xclip.on('close', (code: number, signal: string) => {
        console.log({status: 200, message: 'Clipboard set', clip: clip, target, display, });
    });
    xclip.unref();
} catch (e) {
    console.error(e);
    console.error({status: 500, message: 'Exception setting clipboard', error: e});
}
