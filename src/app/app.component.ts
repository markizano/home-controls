import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ClipboardModule, Clipboard } from '@angular/cdk/clipboard';
import { MatSliderModule } from '@angular/material/slider';

type VolumeResponse = { status: number, message: string, volume: number[] };
type ClipResponse = { status: number, message: string, clip: string };

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        HttpClientModule,
        ClipboardModule,
        MatSliderModule,
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'home-controls';
    vol = 0;
    messages: string[] = [];

    constructor(protected httpClient: HttpClient, protected clip: Clipboard) { }

    ngOnInit() {
        this.httpClient.get<VolumeResponse>('/api/volume', {}).subscribe((x: VolumeResponse) => {
            console.log(x);
            this.vol = x.volume[0] / 65534 * 100;
        });
    }

    volumeUp() {
        this.httpClient.post<VolumeResponse>('/api/volume/up', {}).subscribe((x: VolumeResponse) => {
            console.log(x);
            this.vol = x.volume[0] / 65534 * 100;
        });
    }

    volumeDown() {
        this.httpClient.post<VolumeResponse>('/api/volume/down', {}).subscribe((x) => {
            console.log(x);
            this.vol = x.volume[0] / 65534 * 100;
        });
    }

    volumeSet(value: number) {
        this.httpClient.post<VolumeResponse>(`/api/volume`, {volume: value}).subscribe((x) => {
            console.log(x);
            this.vol = x.volume[0] / 65534 * 100;
        });
    }

    formatLabel(value: number): string {
        return `${value}%`;
    }

    pbCopy() {
        this.httpClient.get<ClipResponse>('/api/clip/primary', {}).subscribe((val) => {
            navigator.clipboard.writeText(val.clip).then(() => {
                console.log('copied');
                this.log({'copied': val});
            });
        });
    }

    pbPaste() {
        navigator.clipboard.readText().then((clipData) => {
            const clip = { clip: clipData, target: 'text/plain' };
            const opts = { headers: new HttpHeaders({'Content-Type': 'application/json'}) };
            this.log('pasting', clipData, opts)
            this.httpClient.post<string>('/api/clip/primary', clip, opts).subscribe((val) => {
                console.log(val);
                this.log('pasted value', val);
            });
            this.httpClient.post<string>('/api/clip/clipboard', clip, opts).subscribe();
        });
    }

    log(...args: unknown[]): void;
    log(msg: unknown): void;
    log(msg: string): void {
        if ( arguments.length > 1 ) {
            msg = Array.from(arguments).map((x) => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
        }
        if (typeof msg !== 'string') {
            msg = JSON.stringify(msg);
        }
        this.messages.unshift(msg);
        if (this.messages.length > 5) {
            this.messages.pop();
        }
    }
}
