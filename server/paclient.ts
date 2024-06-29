import PulseAudio, { Sink } from '@tmigone/pulseaudio'

export type Direction = 'up' | 'down';

export class PaClient {
    client: PulseAudio = new PulseAudio('unix:/tmp/pulse-server');
    sinks: Sink[] = [];
    
    constructor() {
    }

    async connect(): Promise<void> {
        await this.client.connect();

        process.on('exit', () => {
            this.client.disconnect();
        });
    }

    async setVolume(direction: string, step: number = 0.03): Promise<number[]> {
        const vols: number[] = [];
        const sinks = await this.client.getSinkList();
        for (const sink of sinks) {
            const vol = sink.channelVolume.volumes[0], delta = (step * vol), newVol = direction === 'up' ? vol + delta : vol - delta;
            console.log(`Setting volume for sink ${sink.name} to ${newVol}`);
            vols.push( newVol );
            await this.client.setSinkVolume(sink.index, newVol);
        }
        return vols;
    }

    static setVolume(direction: Direction, step: number = 0.03): Promise<number[]> {
        return new PaClient().setVolume(direction, step);
    }
}
