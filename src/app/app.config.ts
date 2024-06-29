import { ApplicationConfig, CSP_NONCE } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        // {
        //     provide: CSP_NONCE,
        //     useValue: globalThis.__CSP_NONCE__ ?? 'kizano-home'
        // }
    ]
};
