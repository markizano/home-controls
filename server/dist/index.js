#!/usr/bin/env ts-node
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const paclient_1 = require("./paclient");
const xclip_1 = require("./xclip");
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 41173;
const app = (0, express_1.default)();
const pc = new paclient_1.PaClient(app);
const xclip = new xclip_1.XclipClient(app);
app.use(express_1.default.json());
if ('WEBROOT' in process.env && process.env.WEBROOT) {
    app.use(express_1.default.static(process.env.WEBROOT));
    console.log(`Serving static content from ${process.env.WEBROOT}`);
}
app.post('/api/shutdown', (req, res) => {
    res.send({ status: 200, message: 'Shutting down...' });
    process.exit(0);
});
app.on('ready', () => {
    console.log('PulseAudio client is ready');
    app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`Server is running on port ${PORT}`);
    }));
});
process.on('SIGINT', () => {
    console.log('Caught interrupt signal');
    process.exit(0);
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield pc.connect();
    app.emit('ready');
}))();
