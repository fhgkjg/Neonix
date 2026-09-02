// ==================== WebSocket سبک (بدون socket.io) ====================
function io(url) {
    const ws = new WebSocket(url.replace(/^https/, 'ws'));
    const handlers = {};
    const pending = {};
    let idc = 0;
    const api = {
        id: null,
        _queue: [],
        on: function (ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); return api; },
        emit: function (ev, data, cb) {
            const m = { type: ev, data: data };
            if (cb) { m.cb = ++idc; pending[idc] = cb; }
            if (ws.readyState === 1) ws.send(JSON.stringify(m));
            else api._queue.push(m);
        }
    };
    ws.onopen = function () {
        (handlers['connect'] || []).forEach(function (fn) { fn(); });
        api._queue.forEach(function (m) { ws.send(JSON.stringify(m)); });
        api._queue = [];
    };
    ws.onclose = function () { (handlers['disconnect'] || []).forEach(function (fn) { fn(); }); };
    ws.onmessage = function (e) {
        let m; try { m = JSON.parse(e.data); } catch (err) { return; }
        if (m.type === 'welcome') { api.id = m.data.id; return; }
        if (m.cb && pending[m.cb]) { const cb = pending[m.cb]; delete pending[m.cb]; cb(m.data); return; }
        (handlers[m.type] || []).forEach(function (fn) { fn(m.data); });
    };
    return api;
}

// ==================== STATE ====================
let socket = null;
let onlineMode = false;
let currentRoom = null;
let myPlayerId = null;
let isHost = false;
let lastInputSent = 0;

function getMyName() {
    const inp = document.getElementById('my-name');
    let n = (inp && inp.value.trim()) || localStorage.getItem('nickname') || '';
    if (!n) n = 'Player' + Math.floor(Math.random() * 999);
    localStorage.setItem('nickname', n);
    if (inp) inp.value = n;
    return n;
}

function connectToServer() {
    const SERVER_URL = window.location.origin;
    socket = io(SERVER_URL);
    socket.on('connect', () => addChatMessage('سیستم', 'اتصال برقرار شد', '#00ff88'));
    socket.on('disconnect', () => addChatMessage('سیستم', 'قطع اتصال...', '#ff416c'));
    socket.on('lobby:list', renderRoomsList);
    socket.on('room:state', (room) => { currentRoom = room; renderWaitingRoom(room); });
    socket.on('room:player_joined', (d) => addChatMessage('سیستم', d.name + ' وارد شد', '#00ff88'));
    socket.on('room:player_left', (d) => {
        addChatMessage('سیستم', d.name + ' خارج شد', '#ff416c');
        if (onlineMode) { onlineMode = false; showOnlineMessage('error', 'حریف خارج شد!'); returnToOnlineMenu(); }
    });
    socket.on('room:kicked', () => { onlineMode = false; showOnlineMessage('error', '❌ کیک شدی!'); returnToOnlineMenu(); });
    socket.on('game:start', (d) => { document.getElementById('waiting-room').style.display = 'none'; startOnlineGame(d.players); });
    socket.on('game:input', handleRemoteInput);
    socket.on('game:event', handleGameEvent);
    socket.on('chat:message', (m) => addChatMessage(m.name, m.text, '#66fcf1'));
    socket.on('connect', () => addChatMessage(t('chat.system'), t('chat.connected'), '#00ff88'));
    socket.on('disconnect', () => addChatMessage(t('chat.system'), t('chat.disconnected'), '#ff416c'));
    socket.on('room:player_joined', (d) => addChatMessage(t('chat.system'), `${d.name} ${t('chat.joined')}`, '#00ff88'));
    socket.on('room:player_left', (d) => addChatMessage(t('chat.system'), `${d.name} ${t('chat.left')}`, '#ff416c'));
    socket.on('room:kicked', () => { onlineMode = false; showOnlineMessage('error', t('wr.kicked')); returnToOnlineMenu(); });
}

function showOnlineMenu() {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('online-menu').style.display = 'flex';
    const saved = localStorage.getItem('nickname');
    if (saved) document.getElementById('my-name').value = saved;
    if (!socket) connectToServer();
    refreshLobby();
}

function returnToOnlineMenu() {
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('online-menu').style.display = 'flex';
    refreshLobby();
}

function leaveOnline() {
    if (currentRoom) leaveRoom();
    document.getElementById('online-menu').style.display = 'none';
    document.getElementById('main-menu').style.display = 'flex';
}

function switchLobbyTab(tab) {
    document.querySelectorAll('.lobby-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.lobby-content').forEach(c => c.style.display = 'none');
    event.target.classList.add('active');
    document.getElementById('lobby-' + tab).style.display = 'block';
}

function togglePrivateOptions() {
    document.getElementById('private-options').style.display =
        document.getElementById('private-room').checked ? 'block' : 'none';
}

function refreshLobby() { if (socket) socket.emit('lobby:list'); }

function renderRoomsList(rooms) {
    const list = document.getElementById('rooms-list');
    if (!rooms || rooms.length === 0) {
        list.innerHTML = `<div class="empty-rooms">${t('online.empty')}</div>`;
        return;
    }
    list.innerHTML = rooms.map(room => `
        <div class="room-card">
            <div class="room-info">
                <h4>🖥️ ${room.name} <span class="public-pill">${t('wr.public')}</span></h4>
                <span>👑 ${room.hostName} | 👥 ${room.playerCount}/${room.maxPlayers}</span>
            </div>
            <button class="room-join-btn" onclick="joinRoom('${room.code}')">${t('online.join_btn')}</button>
        </div>
    `).join('');
}

function createServer() {
    const name = getMyName();
    const serverName = document.getElementById('server-name').value.trim() || ('سرور ' + name);
    const isPrivate = document.getElementById('private-room').checked;
    const customCode = document.getElementById('custom-code').value.trim();
    socket.emit('room:create', { name, color: GameState.p1Color, serverName, isPrivate, customCode }, (res) => {
        if (res.success) {
            myPlayerId = res.playerId;
            isHost = true;
            document.getElementById('online-menu').style.display = 'none';
            document.getElementById('waiting-room').style.display = 'flex';
            document.getElementById('room-code-display').innerText = res.code;
        } else showOnlineMessage('error', res.error);
    });
}

function joinRoom(code) {
    const name = getMyName();
    socket.emit('room:join', { code, name, color: GameState.p1Color }, (res) => {
        if (res.success) {
            myPlayerId = res.playerId;
            isHost = false;
            document.getElementById('online-menu').style.display = 'none';
            document.getElementById('waiting-room').style.display = 'flex';
        } else showOnlineMessage('error', res.error);
    });
}

function joinRoomByCode() {
    const code = document.getElementById('join-code').value.trim();
    if (code.length < 4) { showOnlineMessage('error', 'کد معتبر نیست'); return; }
    joinRoom(code);
}

function renderWaitingRoom(room) {
    document.getElementById('room-code-display').innerText = room.code;
    document.getElementById('wr-title').innerText = '🎯 ' + room.name;
    const me = room.players.find(p => p.socketId === socket.id);
    const roleEl = document.getElementById('wr-role');
    if (me && me.role === 'operator') { 
        roleEl.innerText = t('wr.operator'); 
        roleEl.className = 'role-badge operator'; 
    } else { 
        roleEl.innerText = t('wr.guest'); 
        roleEl.className = 'role-badge guest'; 
    }
    const typeEl = document.getElementById('wr-type');
    typeEl.innerText = room.isPrivate ? t('wr.private') : t('wr.public');
    typeEl.className = 'role-badge ' + (room.isPrivate ? 'private' : 'public');
    document.getElementById('force-start-btn').style.display =
        (me && me.role === 'operator' && room.players.length === 2) ? 'inline-block' : 'none';

    const slots = document.getElementById('player-slots');
    let html = '';
    for (let i = 0; i < room.maxPlayers; i++) {
        const p = room.players[i];
        if (p) {
            const isMe = p.socketId === socket.id;
            const kickHtml = (me && me.role === 'operator' && !isMe)
                ? `<button class="kick-btn" onclick="kickPlayer(${p.id})">${t('wr.kick')}</button>` : '';
            html += `<div class="player-slot filled">
                <div class="avatar" style="background:${p.color};color:${p.color};"></div>
                <div class="name">${p.role === 'operator' ? '👑 ' : '👤 '}${p.name}${isMe ? ' ' + t('wr.me') : ''}</div>
                <div style="color:${p.ready ? '#00ff88' : '#888'};font-size:12px;">${p.ready ? t('wr.ready_status') : t('wr.not_ready')}</div>
                ${kickHtml}</div>`;
        } else {
            html += `<div class="player-slot waiting"><div style="font-size:40px;">❓</div><div style="color:#888;">${t('wr.waiting')}</div></div>`;
        }
    }
    slots.innerHTML = html;
}

function kickPlayer(playerId) {
    if (!isHost) return;
    if (confirm('این بازیکن کیک بشه؟')) socket.emit('room:kick', { playerId });
}
function forceStart() { if (isHost) socket.emit('room:start', {}); }
function copyRoomCode() {
    const code = document.getElementById('room-code-display').innerText;
    navigator.clipboard.writeText(code).then(() => showOnlineMessage('success', t('wr.copied')));
}
function inviteFriend() {
    const code = document.getElementById('room-code-display').innerText;
    const text = `🎮 ${t('online.title')}! ${t('wr.code_hint')} ${code}`;
    navigator.clipboard.writeText(text).then(() => showOnlineMessage('success', t('wr.invited')));
}

let isReady = false;
function toggleReady() {
    isReady = !isReady;
    socket.emit('room:ready', isReady);
    const btn = document.getElementById('ready-btn');
    btn.innerText = isReady ? t('wr.unready') : t('wr.ready');
    btn.style.background = isReady ? '#ff416c' : '#45a29e';
}
function leaveRoom() {
    if (socket) socket.emit('room:leave');
    onlineMode = false;
    document.getElementById('waiting-room').style.display = 'none';
    document.getElementById('online-menu').style.display = 'flex';
    currentRoom = null;
}
function showOnlineMessage(type, msg) {
    const el = document.getElementById('online-message');
    el.className = 'auth-message ' + type;
    el.innerText = msg;
    setTimeout(() => el.style.display = 'none', 3000);
}

// ==================== GAME SYNC ====================
function startOnlineGame(players) {
    onlineMode = true;
    GameState.gameMode = 'online';
    if (typeof resetGame === 'function') resetGame();
    const me = players.find(p => p.id === myPlayerId);
    const opp = players.find(p => p.id !== myPlayerId);
    if (myPlayerId === 1) { GameState.p1.color = me.color; GameState.p2.color = opp.color; }
    else { GameState.p1.color = opp.color; GameState.p2.color = me.color; }
    document.getElementById('ping-display').style.display = 'block';
    document.getElementById('chat-box').style.display = 'flex';
}

function sendInput() {
    if (!onlineMode || !socket) return;
    const now = Date.now();
    if (now - lastInputSent < CONFIG.INPUT_SEND_RATE) return;
    lastInputSent = now;
    const me = myPlayerId === 1 ? GameState.p1 : GameState.p2;
    socket.emit('game:input', { x: me.x, y: me.y, angle: me.angle, hp: me.hp });
}

function handleRemoteInput(data) {
    const remote = myPlayerId === 1 ? GameState.p2 : GameState.p1;
    remote.x = lerp(remote.x, data.x, 0.3);
    remote.y = lerp(remote.y, data.y, 0.3);
    remote.angle = data.angle;
    remote.hp = data.hp;
}

function handleGameEvent(ev) {
    const opp = myPlayerId === 1 ? GameState.p2 : GameState.p1;
    if (ev.type === 'shoot') {
        const angles = ev.triple ? [-0.2, 0, 0.2] : [0];
        angles.forEach(off => {
            const a = opp.angle + off;
            GameArrays.bullets.push({
                x: opp.x + Math.cos(a) * 28, y: opp.y + Math.sin(a) * 28,
                vx: Math.cos(a) * opp.bulletSpeed, vy: Math.sin(a) * opp.bulletSpeed,
                damage: opp.damage, ownerId: ev.playerId, color: opp.color
            });
        });
        playSound('shoot');
    }
}

function addChatMessage(name, text, color) {
    color = color || '#c5c6c7';
    const msgs = document.getElementById('chat-messages');
    if (!msgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.innerHTML = '<span class="name" style="color:' + color + '">' + name + ':</span> ' + text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    while (msgs.children.length > 50) msgs.removeChild(msgs.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-input');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && chatInput.value.trim() && socket) {
                socket.emit('chat:message', chatInput.value.trim());
                addChatMessage('تو', chatInput.value.trim(), '#ffd700');
                chatInput.value = '';
            }
        });
    }
});

let pingInterval = null;
function startPingCheck() {
    if (pingInterval) clearInterval(pingInterval);
    pingInterval = setInterval(() => {
        if (!socket) return;
        const start = Date.now();
        socket.emit('ping', () => {
            const ping = Date.now() - start;
            const g = document.getElementById('game-ping');
            const w = document.getElementById('ping-value');
            if (g) g.innerText = ping;
            if (w) w.innerText = ping;
        });
    }, 2000);
}
