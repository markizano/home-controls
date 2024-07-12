import { ApplicationConfig, CSP_NONCE } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes), provideAnimationsAsync(),
        // {
        //     provide: CSP_NONCE,
        //     useValue: globalThis.__CSP_NONCE__ ?? 'kizano-home'
        // }
    ]
};
