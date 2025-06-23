"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaClient = void 0;
const pulseaudio_1 = __importDefault(require("@tmigone/pulseaudio"));
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const PA_CLIENT = (_a = process.env.PA_CLIENT) !== null && _a !== void 0 ? _a : 'unix:/tmp/pulse-server';
const PA_COOKIE = (0, node_path_1.join)((_b = process.env.HOME) !== null && _b !== void 0 ? _b : '/', '.config', 'pulse', 'cookie');
class PaClient {
    constructor(app) {
        this.client = new pulseaudio_1.default(PA_CLIENT, (0, node_fs_1.existsSync)(PA_COOKIE) ? PA_COOKIE : undefined);
        this.app = app;
        this.connect().then(() => app.emit('ready'));
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            // If the file is absent/empty, search the environment variable and the cookie to disk before connecting/authenticating.
            if (!(0, node_fs_1.existsSync)(PA_COOKIE) || (0, node_fs_1.statSync)(PA_COOKIE).size === 0) {
                if ('PULSE_COOKIE' in process.env && process.env.PULSE_COOKIE) {
                    if (process.env.PULSE_COOKIE.startsWith('hex')) {
                        console.log('Found pulse cookie env var as hex.');
                        this.client.cookie = Buffer.from(process.env.PULSE_COOKIE.split(':', 2)[1], 'hex');
                    }
                    else if (process.env.PULSE_COOKIE.startsWith('base64')) {
                        console.log('Found pulse cookie env var as base64.');
                        this.client.cookie = Buffer.from(process.env.PULSE_COOKIE.split(':', 2)[1], 'base64');
                    }
                }
            }
            yield this.client.connect();
            this.app.get('/api/volume', (req, res) => this.getVolume(req, res));
            this.app.post('/api/volume', (req, res) => this.setVolume(req, res));
            this.app.post('/api/volume/:direction', (req, res) => this.setVolume(req, res));
            process.on('exit', () => {
                this.client.disconnect();
            });
        });
    }
    setVolume(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const vols = [];
            const step = parseFloat(req.params.step) || 0.03;
            const response = { status: 0, message: '', volume: [] };
            try {
                const sinks = yield this.client.getSinkList();
                for (const sink of sinks) {
                    let newVol;
                    if (typeof ((_a = req.params) === null || _a === void 0 ? void 0 : _a.direction) !== 'undefined') {
                        const vol = sink.channelVolume.volumes[0], delta = (step * vol);
                        newVol = req.params.direction === 'up' ? vol + delta : vol - delta;
                    }
                    else {
                        newVol = (req.body.volume / 100) * 65534;
                    }
                    console.log(`Setting volume for sink ${sink.name} to ${newVol}`);
                    vols.push(newVol);
                    yield this.client.setSinkVolume(sink.index, newVol);
                }
                response.status = 201;
                response.volume = vols;
                response.message = `Volume set with volumes: ${vols}`;
            }
            catch (err) {
                console.error('Exception setting volume: ', err);
                response.status = 500;
                response.message = `Exception setting volume: ${err}`;
                response.error = err;
            }
            res.send(response);
            return vols;
        });
    }
    getVolume(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = { status: 0, message: '', volume: [] };
            try {
                const sinks = yield this.client.getSinkList();
                response.volume = sinks.map(sink => sink.channelVolume.volumes[0]);
                response.status = 200;
                response.message = 'Volume levels';
            }
            catch (err) {
                console.error('Exception getting volume: ', err);
                response.status = 500;
                response.message = `Exception getting volume: ${err}`;
                response.error = err;
            }
            res.send(response);
        });
    }
}
exports.PaClient = PaClient;
