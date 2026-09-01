// server.js — NEONIX | XENOVA Studios (Crash-Proof v3)
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

// 🛡️ سپر ضد کرش — سرور هرگز نمی‌میره
process.on('uncaughtException', (e) => console.error('⚠️ uncaughtException:', e.message));
process.on('unhandledRejection', (e) => console.error('⚠️ unhandledRejection:', e && e.message));

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon', '.svg': 'image/svg+xml'
};

// ---------- فایل‌های استاتیک (ضد کرش + لاگ) ----------
const server = http.createServer((req, res) => {
    try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = path.normalize(path.join(PUBLIC_DIR, urlPath));
        if (filePath.indexOf(PUBLIC_DIR) !== 0) { res.writeHead(403); res.end('Forbidden'); return; }
        fs.readFile(filePath, (err, data) => {
            try {
                if (err) { console.log('❌ 404:', urlPath); res.writeHead(404); res.end('404'); return; }
                res.writeHead(200, {
                    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
                    'Cache-Control': 'no-cache'
                });
                res.end(data);
                console.log('✅ 200:', urlPath);
            } catch (e) { console.error('❌ send error:', e.message); }
        });
    } catch (e) {
        console.error('❌ request error:', e.message);
        try { res.writeHead(500); res.end('Server Error'); } catch (_) {}
    }
});

// ---------- WebSocket سبک ----------
const clients = new Set();

function sendFrame(socket, payload, opcode) {
    opcode = opcode || 0x81;
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    let header;
    if (data.length < 126) header = Buffer.from([opcode, data.length]);
    else if (data.length < 65536) {
        header = Buffer.alloc(4); header[0] = opcode; header[1] = 126;
        header.writeUInt16BE(data.length, 2);
    } else {
        header = Buffer.alloc(10); header[0] = opcode; header[1] = 127;
        header.writeBigUInt64BE(BigInt(data.length), 2);
    }
    try { socket.write(Buffer.concat([header, data])); } catch (e) {}
}

function makeClient(socket) {
    return {
        id: crypto.randomBytes(6).toString('hex'),
        socket: socket, buffer: Buffer.alloc(0), alive: true,
        send: function (o) { if (this.alive) sendFrame(socket, JSON.stringify(o)); },
        close: function () { this.alive = false; try { socket.end(); } catch (e) {} }
    };
}

function parseFrames(client) {
    while (true) {
        const buf = client.buffer;
        if (buf.length < 2) return;
        const opcode = buf[0] & 0x0f;
        const masked = (buf[1] & 0x80) !== 0;
        let len = buf[1] & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        const pOff = off + (masked ? 4 : 0);
        if (buf.length < pOff + len) return;
        let payload;
        if (masked) {
            payload = Buffer.alloc(len);
            for (let i = 0; i < len; i++) payload[i] = buf[pOff + i] ^ buf[off + (i % 4)];
        } else payload = buf.slice(pOff, pOff + len);
        client.buffer = buf.slice(pOff + len);
        if (opcode === 0x8) { client.close(); return; }
        if (opcode === 0x9) { sendFrame(client.socket, payload, 0x8A); continue; }
        if (opcode === 0x1) {
            let m; try { m = JSON.parse(payload.toString('utf8')); } catch (e) { continue; }
            try { onMessage(client, m); } catch (e) { console.error('❌ msg error:', e.message); }
        }
    }
}

// ---------- اتاق‌ها (اپراتور/مهمان + کیک) ----------
const rooms = new Map();
const playerByClient = new Map();

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c; do { c = ''; for (let i = 0; i < 6; i++) c += chars[Math.floor(Math.random() * chars.length)]; } while (rooms.has(c));
    return c;
}
function findClient(id) { for (const c of clients) if (c.id === id) return c; return null; }
function forRoom(room, fn) { room.players.forEach(p => { const c = findClient(p.socketId); if (c) fn(c); }); }
function forRoomOthers(room, s, fn) { room.players.forEach(p => { const c = findClient(p.socketId); if (c && c !== s) fn(c); }); }
function roomOf(c) { const p = playerByClient.get(c.id); return p ? rooms.get(p.roomId) : null; }
function lobbyList() {
    const l = [];
    for (const e of rooms) { const r = e[1]; if (!r.isPrivate && r.state === 'waiting') l.push({ code: r.code, name: r.name, hostName: r.hostName, playerCount: r.players.length, maxPlayers: r.maxPlayers }); }
    return l;
}
function broadcastLobby() { const l = lobbyList(); for (const c of clients) c.send({ type: 'lobby:list', data: l }); }
function sendRoomState(r) { forRoom(r, c => c.send({ type: 'room:state', data: r })); }
function startGame(r) {
    r.state = 'playing';
    forRoom(r, c => c.send({ type: 'game:start', data: { players: r.players.map(p => ({ id: p.id, name: p.name, color: p.color, role: p.role })) } }));
    broadcastLobby();
}
function handleLeave(client) {
    const info = playerByClient.get(client.id);
    if (!info) return;
    playerByClient.delete(client.id);
    const room = rooms.get(info.roomId);
    if (!room) return;
    room.players = room.players.filter(p => p.socketId !== client.id);
    if (room.players.length === 0) rooms.delete(room.code);
    else {
        if (room.hostId === client.id) { room.hostId = room.players[0].socketId; room.hostName = room.players[0].name; room.players[0].role = 'operator'; }
        forRoom(room, c => c.send({ type: 'room:player_left', data: { name: info.name } }));
        sendRoomState(room);
    }
    broadcastLobby();
}

function onMessage(client, msg) {
    if (!msg || !msg.type) return;
    const d = msg.data, cb = msg.cb;

    if (msg.type === 'ping') client.send({ type: 'ping', cb: cb, data: Date.now() });
    else if (msg.type === 'lobby:list') client.send({ type: 'lobby:list', data: lobbyList() });
    else if (msg.type === 'room:create') {
        let code = null;
        if (d.isPrivate && d.customCode) {
            const cc = String(d.customCode).toUpperCase().trim();
            if (!/^[A-Z0-9]{4,10}$/.test(cc)) { if (cb) client.send({ cb: cb, data: { success: false, error: 'کد باید ۴-۱۰ کاراکتر باشد' } }); return; }
            if (rooms.has(cc)) { if (cb) client.send({ cb: cb, data: { success: false, error: 'این کد گرفته شده' } }); return; }
            code = cc;
        } else code = generateRoomCode();
        const room = { code: code, name: d.serverName || ('سرور ' + d.name), hostId: client.id, hostName: d.name, isPrivate: !!d.isPrivate, maxPlayers: 2, players: [{ id: 1, socketId: client.id, name: d.name, color: d.color, ready: false, role: 'operator' }], state: 'waiting', createdAt: Date.now() };
        rooms.set(code, room);
        playerByClient.set(client.id, { roomId: code, name: d.name, color: d.color, id: 1 });
        if (cb) client.send({ cb: cb, data: { success: true, code: code, playerId: 1, role: 'operator' } });
        sendRoomState(room); broadcastLobby();
    }
    else if (msg.type === 'room:join') {
        const code = String(d.code || '').toUpperCase().trim();
        const room = rooms.get(code);
        if (!room) { if (cb) client.send({ cb: cb, data: { success: false, error: 'اتاق پیدا نشد' } }); return; }
        if (room.state !== 'waiting') { if (cb) client.send({ cb: cb, data: { success: false, error: 'بازی در حال انجام است' } }); return; }
        if (room.players.length >= room.maxPlayers) { if (cb) client.send({ cb: cb, data: { success: false, error: 'سرور پر است' } }); return; }
        const pid = room.players.length + 1;
        room.players.push({ id: pid, socketId: client.id, name: d.name, color: d.color, ready: false, role: 'guest' });
        playerByClient.set(client.id, { roomId: code, name: d.name, color: d.color, id: pid });
        if (cb) client.send({ cb: cb, data: { success: true, playerId: pid, role: 'guest' } });
        forRoom(room, c => c.send({ type: 'room:player_joined', data: { name: d.name, id: pid } }));
        sendRoomState(room); broadcastLobby();
    }
    else if (msg.type === 'room:ready') {
        const room = roomOf(client); if (!room) return;
        const p = room.players.find(x => x.socketId === client.id);
        if (p) { p.ready = !!d; sendRoomState(room); if (room.players.length === 2 && room.players.every(x => x.ready)) startGame(room); }
    }
    else if (msg.type === 'room:start') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        if (p && p.id === 1 && room.players.length === 2) startGame(room);
    }
    else if (msg.type === 'room:kick') {
        const room = roomOf(client); if (!room) return;
        const me = playerByClient.get(client.id);
        if (!me || me.id !== 1) return;
        const t = room.players.find(x => x.id === d.playerId);
        if (!t || t.socketId === client.id) return;
        const tc = findClient(t.socketId);
        if (tc) tc.send({ type: 'room:kicked', data: {} });
        room.players = room.players.filter(x => x.id !== d.playerId);
        playerByClient.delete(t.socketId);
        forRoom(room, c => c.send({ type: 'room:player_left', data: { name: t.name } }));
        sendRoomState(room); broadcastLobby();
    }
    else if (msg.type === 'room:leave') handleLeave(client);
    else if (msg.type === 'game:input') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        forRoomOthers(room, client, c => c.send({ type: 'game:input', data: Object.assign({ playerId: p.id }, d) }));
    }
    else if (msg.type === 'game:event') {
        const room = roomOf(client); if (!room) return;
        forRoomOthers(room, client, c => c.send({ type: 'game:event', data: d }));
    }
    else if (msg.type === 'chat:message') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        forRoom(room, c => c.send({ type: 'chat:message', data: { name: p.name, text: d, time: Date.now() } }));
    }
}

server.on('upgrade', (req, socket) => {
    try {
        const key = req.headers['sec-websocket-key'];
        if (!key) { socket.destroy(); return; }
        const accept = crypto.createHash('sha1').update(key + MAGIC).digest('base64');
        socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
        const client = makeClient(socket);
        clients.add(client);
        socket.on('data', ch => { client.buffer = Buffer.concat([client.buffer, ch]); parseFrames(client); });
        const clean = () => { clients.delete(client); handleLeave(client); };
        socket.on('close', clean);
        socket.on('error', clean);
        client.send({ type: 'welcome', data: { id: client.id } });
    } catch (e) { console.error('❌ upgrade error:', e.message); try { socket.destroy(); } catch (_) {} }
});

server.listen(PORT, () => console.log('🎮 NEONIX server running on port ' + PORT));
