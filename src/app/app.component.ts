import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type VolumeResponse = { status: number, message: string, volume: number[] };

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, HttpClientModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'home-controls';
    vol = 0;

    constructor(protected httpClient: HttpClient) { }

    ngOnInit() {
        this.httpClient.get<VolumeResponse>('/api/volume', {}).subscribe((x: VolumeResponse) => {
            console.log(x);
            this.vol = x.volume[0] / 65534;
        });
    }

    volumeUp() {
        this.httpClient.get<VolumeResponse>('/api/volume/up', {}).subscribe((x: VolumeResponse) => {
            console.log(x);
            this.vol = x.volume[0] / 65534;
        });
    }

    volumeDown() {
        this.httpClient.get<VolumeResponse>('/api/volume/down', {}).subscribe((x) => {
            console.log(x);
            this.vol = x.volume[0] / 65534;
        });
    }
}
