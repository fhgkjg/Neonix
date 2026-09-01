// server.js v2 — با نقش اپراتور/مهمان، کیک، سرور خصوصی/عمومی
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const MAGIC = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';

// ---------- WebSocket سبک ----------
const clients = new Set();

function sendFrame(socket, payload, opcode) {
    opcode = opcode || 0x81;
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
    let header;
    if (data.length < 126) header = Buffer.from([opcode, data.length]);
    else if (data.length < 65536) {
        header = Buffer.alloc(4);
        header[0] = opcode; header[1] = 126;
        header.writeUInt16BE(data.length, 2);
    } else {
        header = Buffer.alloc(10);
        header[0] = opcode; header[1] = 127;
        header.writeBigUInt64BE(BigInt(data.length), 2);
    }
    try { socket.write(Buffer.concat([header, data])); } catch (e) {}
}

function makeClient(socket) {
    return {
        id: crypto.randomBytes(6).toString('hex'),
        socket: socket,
        buffer: Buffer.alloc(0),
        alive: true,
        send: function (obj) { if (this.alive) sendFrame(socket, JSON.stringify(obj)); },
        close: function () { this.alive = false; try { socket.end(); } catch (e) {} }
    };
}

function parseFrames(client) {
    while (true) {
        const buf = client.buffer;
        if (buf.length < 2) return;
        const opcode = buf[0] & 0x0f;
        const masked = (buf[1] & 0x80) !== 0;
        let len = buf[1] & 0x7f;
        let off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        const payloadOff = off + (masked ? 4 : 0);
        if (buf.length < payloadOff + len) return;
        let payload;
        if (masked) {
            payload = Buffer.alloc(len);
            for (let i = 0; i < len; i++) payload[i] = buf[payloadOff + i] ^ buf[off + (i % 4)];
        } else payload = buf.slice(payloadOff, payloadOff + len);
        client.buffer = buf.slice(payloadOff + len);

        if (opcode === 0x8) { client.close(); return; }
        if (opcode === 0x9) { sendFrame(client.socket, payload, 0x8A); continue; }
        if (opcode === 0x1) {
            let msg;
            try { msg = JSON.parse(payload.toString('utf8')); } catch (e) { continue; }
            onMessage(client, msg);
        }
    }
}

// ---------- اتاق‌ها ----------
const rooms = new Map();
const playerByClient = new Map();

function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        code = '';
        for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    } while (rooms.has(code));
    return code;
}
function findClient(id) { for (const c of clients) if (c.id === id) return c; return null; }
function forRoom(room, fn) {
    room.players.forEach(function (p) { const c = findClient(p.socketId); if (c) fn(c); });
}
function forRoomOthers(room, sender, fn) {
    room.players.forEach(function (p) { const c = findClient(p.socketId); if (c && c !== sender) fn(c); });
}
function roomOf(client) {
    const p = playerByClient.get(client.id);
    return p ? rooms.get(p.roomId) : null;
}
function lobbyList() {
    const list = [];
    for (const entry of rooms) {
        const room = entry[1];
        // فقط عمومی‌ها در لیست دیده می‌شوند
        if (!room.isPrivate && room.state === 'waiting') {
            list.push({
                code: room.code, name: room.name, hostName: room.hostName,
                playerCount: room.players.length, maxPlayers: room.maxPlayers
            });
        }
    }
    return list;
}
function broadcastLobby() {
    const list = lobbyList();
    for (const c of clients) c.send({ type: 'lobby:list', data: list });
}
function sendRoomState(room) {
    forRoom(room, function (c) { c.send({ type: 'room:state', data: room }); });
}
function startGame(room) {
    room.state = 'playing';
    forRoom(room, function (c) {
        c.send({ type: 'game:start', data: { players: room.players.map(function (p) { return { id: p.id, name: p.name, color: p.color, role: p.role }; }) } });
    });
    broadcastLobby();
}
function handleLeave(client) {
    const info = playerByClient.get(client.id);
    if (!info) return;
    playerByClient.delete(client.id);
    const room = rooms.get(info.roomId);
    if (!room) return;
    room.players = room.players.filter(function (p) { return p.socketId !== client.id; });
    if (room.players.length === 0) rooms.delete(room.code);
    else {
        if (room.hostId === client.id) {
            // اپراتور رفت → نفر بعدی اپراتور می‌شود
            room.hostId = room.players[0].socketId;
            room.hostName = room.players[0].name;
            room.players[0].role = 'operator';
        }
        forRoom(room, function (c) { c.send({ type: 'room:player_left', data: { name: info.name } }); });
        sendRoomState(room);
    }
    broadcastLobby();
}

function onMessage(client, msg) {
    if (!msg || !msg.type) return;
    const data = msg.data;
    const cb = msg.cb;

    if (msg.type === 'ping') client.send({ type: 'ping', cb: cb, data: Date.now() });

    else if (msg.type === 'lobby:list') client.send({ type: 'lobby:list', data: lobbyList() });

    else if (msg.type === 'room:create') {
        // ساخت سرور — سازنده = اپراتور
        let code = null;
        if (data.isPrivate && data.customCode) {
            const cc = String(data.customCode).toUpperCase().trim();
            if (!/^[A-Z0-9]{4,10}$/.test(cc)) { if (cb) client.send({ cb: cb, data: { success: false, error: 'کد باید ۴ تا ۰ کاراکتر (حروف/اعداد) باشد' } }); return; }
            if (rooms.has(cc)) { if (cb) client.send({ cb: cb, data: { success: false, error: 'این کد قبلاً گرفته شده' } }); return; }
            code = cc;
        } else code = generateRoomCode();

        const room = {
            code: code,
            name: data.serverName || ('سرور ' + data.name),
            hostId: client.id, hostName: data.name,
            isPrivate: !!data.isPrivate, maxPlayers: 2,
            players: [{ id: 1, socketId: client.id, name: data.name, color: data.color, ready: false, role: 'operator' }],
            state: 'waiting', createdAt: Date.now()
        };
        rooms.set(code, room);
        playerByClient.set(client.id, { roomId: code, name: data.name, color: data.color, id: 1 });
        if (cb) client.send({ cb: cb, data: { success: true, code: code, playerId: 1, role: 'operator' } });
        sendRoomState(room);
        broadcastLobby();
    }

    else if (msg.type === 'room:join') {
        const code = String(data.code || '').toUpperCase().trim();
        const room = rooms.get(code);
        if (!room) { if (cb) client.send({ cb: cb, data: { success: false, error: 'اتاقی با این کد پیدا نشد' } }); return; }
        if (room.state !== 'waiting') { if (cb) client.send({ cb: cb, data: { success: false, error: 'بازی در حال انجام است' } }); return; }
        if (room.players.length >= room.maxPlayers) { if (cb) client.send({ cb: cb, data: { success: false, error: 'سرور پر است' } }); return; }
        const pid = room.players.length + 1;
        room.players.push({ id: pid, socketId: client.id, name: data.name, color: data.color, ready: false, role: 'guest' });
        playerByClient.set(client.id, { roomId: code, name: data.name, color: data.color, id: pid });
        if (cb) client.send({ cb: cb, data: { success: true, playerId: pid, role: 'guest' } });
        forRoom(room, function (c) { c.send({ type: 'room:player_joined', data: { name: data.name, id: pid } }); });
        sendRoomState(room);
        broadcastLobby();
    }

    else if (msg.type === 'room:ready') {
        const room = roomOf(client); if (!room) return;
        const p = room.players.find(function (x) { return x.socketId === client.id; });
        if (p) {
            p.ready = !!data;
            sendRoomState(room);
            if (room.players.length === 2 && room.players.every(function (x) { return x.ready; })) startGame(room);
        }
    }

    // شروع اجباری توسط اپراتور
    else if (msg.type === 'room:start') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        if (p && p.id === 1 && room.players.length === 2) startGame(room);
    }

    // کیک توسط اپراتور
    else if (msg.type === 'room:kick') {
        const room = roomOf(client); if (!room) return;
        const me = playerByClient.get(client.id);
        if (!me || me.id !== 1) return; // فقط اپراتور
        const target = room.players.find(function (x) { return x.id === data.playerId; });
        if (!target || target.socketId === client.id) return;
        const tc = findClient(target.socketId);
        if (tc) tc.send({ type: 'room:kicked', data: { by: room.hostName } });
        room.players = room.players.filter(function (x) { return x.id !== data.playerId; });
        playerByClient.delete(target.socketId);
        forRoom(room, function (c) { c.send({ type: 'room:player_left', data: { name: target.name } }); });
        sendRoomState(room);
        broadcastLobby();
    }

    else if (msg.type === 'room:leave') handleLeave(client);

    else if (msg.type === 'game:input') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        const out = Object.assign({ playerId: p.id }, data);
        forRoomOthers(room, client, function (c) { c.send({ type: 'game:input', data: out }); });
    }

    else if (msg.type === 'game:event') {
        const room = roomOf(client); if (!room) return;
        forRoomOthers(room, client, function (c) { c.send({ type: 'game:event', data: data }); });
    }

    else if (msg.type === 'chat:message') {
        const room = roomOf(client); if (!room) return;
        const p = playerByClient.get(client.id);
        forRoom(room, function (c) { c.send({ type: 'chat:message', data: { name: p.name, text: data, time: Date.now() } }); });
    }
}

// ---------- HTTP + Upgrade ----------
const server = http.createServer(function (req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (urlPath === '/') urlPath = '/index.html';
    const publicDir = path.join(__dirname, 'public');
    const filePath = path.join(publicDir, urlPath);
    if (filePath.indexOf(publicDir) !== 0) { res.writeHead(403); res.end(); return; }
    fs.readFile(filePath, function (err, fileData) {
        if (err) { res.writeHead(404); res.end('404'); return; }
        const ext = path.extname(filePath).toLowerCase();
        const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ico': 'image/x-icon' };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(fileData);
    });
});

server.on('upgrade', function (req, socket) {
    const key = req.headers['sec-websocket-key'];
    if (!key) { socket.destroy(); return; }
    const accept = crypto.createHash('sha1').update(key + MAGIC).digest('base64');
    socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
    const client = makeClient(socket);
    clients.add(client);
    socket.on('data', function (chunk) { client.buffer = Buffer.concat([client.buffer, chunk]); parseFrames(client); });
    const cleanup = function () { clients.delete(client); handleLeave(client); };
    socket.on('close', cleanup);
    socket.on('error', cleanup);
    client.send({ type: 'welcome', data: { id: client.id } });
});

server.listen(PORT, function () {
    console.log('🎮 سرور نبرد نئونی v2 اجرا شد: http://localhost:' + PORT);
});
