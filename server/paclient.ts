import { Express, Request, Response } from 'express';
import PulseAudio from '@tmigone/pulseaudio'
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

type Direction = 'up' | 'down';
type VolumeResponse = {status: number, message: string, volume: number[], error?: Error};
const PA_CLIENT = process.env.PA_CLIENT ?? 'unix:/tmp/pulse-server';
const PA_COOKIE = join(process.env.HOME ?? '/', '.config', 'pulse', 'cookie');

export class PaClient {
    client: PulseAudio = new PulseAudio(PA_CLIENT, PA_COOKIE);
    app: Express;

    constructor(app: Express) {
        this.app = app;
    }

    async connect(): Promise<void> {
        // If the file is absent/empty, search the environment variable and the cookie to disk before connecting/authenticating.
        if ( !existsSync(PA_COOKIE) || statSync(PA_COOKIE).size === 0 ) {
            if ( 'PULSE_COOKIE' in process.env && process.env.PULSE_COOKIE ) {
                if ( process.env.PULSE_COOKIE.startsWith('hex') ){
                    console.log('Found pulse cookie env var as hex.')
                    this.client.cookie = Buffer.from(process.env.PULSE_COOKIE.split(':', 2)[1], 'hex');
                } else if ( process.env.PULSE_COOKIE.startsWith('base64') ) {
                    console.log('Found pulse cookie env var as base64.')
                    this.client.cookie = Buffer.from(process.env.PULSE_COOKIE.split(':', 2)[1], 'base64');
                }
            }
        }
        await this.client.connect();
        this.app.get('/api/volume', (req, res) => this.getVolume(req, res));
        this.app.post('/api/volume', (req, res) => this.setVolume(req, res));
        this.app.post('/api/volume/:direction', (req, res) => this.setVolume(req, res));

        process.on('exit', () => {
            this.client.disconnect();
        });
    }

    async setVolume(req: Request, res: Response): Promise<number[]> {
        const vols: number[] = [];
        const step: number = parseFloat(req.params.step) || 0.03;
        const response: VolumeResponse = {status: 0, message: '', volume: []};
        try {
            const sinks = await this.client.getSinkList();
            for (const sink of sinks) {
                let newVol: number;
                if ( typeof req.params?.direction !== 'undefined' ) {
                    const vol = sink.channelVolume.volumes[0],
                      delta = (step * vol);
                    newVol = req.params.direction === 'up' ? vol + delta : vol - delta;

                } else {
                    newVol = (req.body.volume / 100) * 65534;
                }
                console.log(`Setting volume for sink ${sink.name} to ${newVol}`);
                vols.push( newVol );
                await this.client.setSinkVolume(sink.index, newVol);
            }
            response.status = 201;
            response.volume = vols;
            response.message = `Volume set with volumes: ${vols}`;
        } catch (err) {
            console.error('Exception setting volume: ', err);
            response.status = 500;
            response.message = `Exception setting volume: ${err}`;
            response.error = <Error>err;
        }
        res.send(response);
        return vols;
    }

    async getVolume(req: Request, res: Response): Promise<void> {
        const response: VolumeResponse = {status: 0, message: '', volume: []};
        try {
            const sinks = await this.client.getSinkList();
            response.volume = sinks.map(sink => sink.channelVolume.volumes[0]);
            response.status = 200;
            response.message = 'Volume levels';
        } catch (err) {
            console.error('Exception getting volume: ', err);
            response.status = 500;
            response.message = `Exception getting volume: ${err}`;
            response.error = <Error>err;
        }
        res.send(response);
    }
}
