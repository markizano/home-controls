#!/usr/bin/env ts-node

import express from 'express';
import { config } from 'dotenv';

config();

import { PaClient } from './paclient';
import { XclipClient } from './xclip';

const app = express();
const pc = new PaClient(app);
const xclip = new XclipClient(app);
const PORT = process.env.PORT ?? 41173;

app.use(express.json());

if ( 'WEBROOT' in process.env && process.env.WEBROOT ) {
    app.use(express.static(process.env.WEBROOT));
    console.log(`Serving static content from ${process.env.WEBROOT}`);
}

app.post('/api/shutdown', (req, res) => {
    res.send({status: 200, message: 'Shutting down...'});
    process.exit(0);
});

app.on('ready', () => {
    console.log('PulseAudio client is ready');
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    process.exit(0);
});

(async () => {
    await pc.connect();
    app.emit('ready');
})();
