// ==================== I18N - MULTI-LANGUAGE SUPPORT ====================
const TRANSLATIONS = {
    en: {
        // Menu
        'menu.title': '⚡ NEON BATTLE ⚡',
        'menu.subtitle': 'Advanced Edition - With New Features!',
        'menu.mode': '🎮 Game Mode',
        'menu.map': '🗺️ Select Map',
        'menu.customize': '🎨 Customize',
        'menu.settings': '⚙️ Settings',
        'menu.help': '❓ Help',
        'menu.leaderboard': '🏆 Leaderboard',
        
        // Game Modes
        'mode.title': 'Select Game Mode',
        'mode.online': '🌐 Online Game',
        'mode.pvp': '👥 Local 2-Player',
        'mode.bot': '🤖 Play vs Bot',
        'mode.easy': 'Easy',
        'mode.medium': 'Medium',
        'mode.hard': 'Hard',
        'mode.insane': 'Insane',
        
        // Maps
        'map.arena': 'Arena',
        'map.arena_desc': 'Classic balanced map',
        'map.maze': 'Maze',
        'map.maze_desc': 'Full of winding paths',
        'map.castle': 'Castle',
        'map.castle_desc': 'Symmetric with central castle',
        'map.space': 'Space',
        'map.space_desc': 'Scattered obstacles, open',
        'map.jungle': 'Jungle',
        'map.jungle_desc': 'Dense natural obstacles',
        'map.random': 'Random',
        'map.random_desc': 'Randomly generated map',
        
        // Customize
        'custom.title': '🎨 Customize Characters',
        'custom.player1': 'Player 1',
        'custom.player2': 'Player 2',
        'custom.custom_color': 'Custom Color',
        'custom.shape': 'Character Shape',
        
        // Settings
        'settings.title': '⚙️ Settings',
        'settings.sound': '🔊 Game Sound',
        'settings.music': '🎵 Background Music',
        'settings.fx': '💥 Effects Intensity',
        'settings.fx_low': 'Low',
        'settings.fx_medium': 'Medium',
        'settings.fx_high': 'High',
        'settings.win_score': '🏆 Win Score',
        'settings.kills': 'kills',
        'settings.touch': '📱 Touch Controls',
        'settings.minimap': '🗺️ Minimap',
        'settings.language': '🌐 Language',
        
        // Help
        'help.title': '❓ Game Guide',
        'help.movement': 'Movement',
        'help.shoot': 'Shoot',
        'help.shop': 'Shop',
        'help.dash': 'Dash',
        'help.grenade': 'Grenade',
        'help.pause': '⏸️ Pause',
        
        // In-Game
        'game.player1': 'Player 1',
        'game.player2': 'Player 2',
        'game.bot': 'Bot',
        'game.score': 'Score',
        'game.coins': 'Coins',
        'game.kills': 'Kills',
        'game.wins': 'Wins!',
        'game.winner': 'wins!',
        
        // Floating Texts
        'fx.damage': 'Damage',
        'fx.heal': 'Heal',
        'fx.blocked': 'Blocked!',
        'fx.shield': 'Shield!',
        'fx.level_up': 'LEVEL UP!',
        'fx.bonus': 'Bonus',
        'fx.upgrade': '✨ Upgrade!',
        'fx.speed': '⚡ Speed!',
        'fx.triple': '🔫 Triple!',
        'fx.rapid': '🔥 Rapid!',
        'fx.invisible': '👻 Invisible!',
        'fx.respawn': 'Respawning...',
        
        // Kill Streaks
        'streak.double': 'Double Kill!',
        'streak.triple': 'Triple Kill!',
        'streak.ultra': 'Ultra Kill!',
        'streak.rampage': 'RAMPAGE!',
        'streak.unstoppable': 'UNSTOPPABLE!',
        
        // Shop
        'shop.p1_title': '🛒 P1 Shop',
        'shop.p2_title': '🛒 P2 Shop',
        'shop.damage': '💪 Damage +5',
        'shop.speed': '🏃 Speed +0.5',
        'shop.bullet': '🚀 Bullet Speed +2',
        'shop.heal': '❤️ Heal +30',
        'shop.triple': '🔫 Triple Shot',
        'shop.shield': '🛡️ Super Shield',
        'shop.hint': 'Heal via stars on map',
        
        // Online
        'online.title': '🌐 Online Game',
        'online.subtitle': 'Connect with friends and play!',
        'online.public': '🌍 Public Servers',
        'online.create': '🛠️ Create Server',
        'online.join': '🔑 Join by Code',
        'online.server_name': '🖥️ Server Name',
        'online.private': '🔒 Private (not shown in list)',
        'online.custom_code': '🔑 Custom Code (optional)',
        'online.create_btn': '🛠️ Create Server',
        'online.join_btn': 'Join Server',
        'online.refresh': '🔄 Refresh',
        'online.empty': '🌌 No active public servers<br>Create the first one!',
        'online.loading': 'Loading...',
        'online.my_name': '👤 Your Name',
        'online.back': 'Back',
        
        // Waiting Room
        'wr.title': '🎯 Server',
        'wr.code_hint': 'Share this code with your friend:',
        'wr.copy': '📋 Copy Code',
        'wr.invite': '✉️ Invite',
        'wr.ready': '✋ Ready',
        'wr.unready': '❌ Cancel Ready',
        'wr.force_start': '🚀 Force Start',
        'wr.leave': 'Leave',
        'wr.operator': '👑 Operator',
        'wr.guest': '👤 Guest',
        'wr.public': '🌍 Public',
        'wr.private': '🔒 Private',
        'wr.waiting': 'Waiting...',
        'wr.ready_status': '✅ Ready',
        'wr.not_ready': '⏳ Waiting',
        'wr.ping': 'Ping',
        'wr.kick': '❌ Kick',
        'wr.me': '(You)',
        'wr.copied': 'Code copied!',
        'wr.invited': '✉️ Invite text copied!',
        'wr.kicked': '❌ Kicked by operator!',
        
        // Chat
        'chat.placeholder': 'Type a message... (Enter)',
        'chat.system': 'System',
        'chat.connected': 'Connected',
        'chat.disconnected': 'Disconnected...',
        'chat.joined': 'joined',
        'chat.left': 'left',
        
        // Pause Menu
        'pause.title': '⏸️ Paused',
        'pause.resume': '▶️ Resume',
        'pause.restart': '🔄 Restart',
        'pause.menu': '🏠 Main Menu',
        
        // Game Over
        'gameover.title': 'Game Over',
        'gameover.stats': 'Final Stats',
        'gameover.accuracy': 'Accuracy',
        'gameover.play_again': '🔄 Play Again',
        'gameover.main_menu': '🏠 Main Menu',
        
        // Leaderboard
        'lb.title': '🏆 Top Scores',
        'lb.empty': 'No records yet!',
        'lb.clear': 'Clear',
        'lb.confirm': 'Are you sure?',
        
        // Errors
        'error.code_6': 'Code must be 6 characters',
        'error.invalid_code': 'Invalid code',
        'error.not_found': 'Server not found',
        'error.game_started': 'Game in progress',
        'error.server_full': 'Server is full',
        'error.code_taken': 'This code is already taken',
        'error.code_format': 'Code must be 4-10 characters (letters/numbers)',
        
        // Misc
        'misc.confirm': 'Are you sure?',
        'misc.yes': 'Yes',
        'misc.no': 'No'
    },
    
    fa: {
        'menu.title': '⚡ نبرد نئونی ⚡',
        'menu.subtitle': 'نسخه فوق‌پیشرفته - با قابلیت‌های جدید!',
        'menu.mode': '🎮 حالت بازی',
        'menu.map': '🗺️ انتخاب مپ',
        'menu.customize': '🎨 شخصی‌سازی',
        'menu.settings': '⚙️ تنظیمات',
        'menu.help': '❓ راهنما',
        'menu.leaderboard': '🏆 برترین‌ها',
        
        'mode.title': 'انتخاب حالت بازی',
        'mode.online': '🌐 بازی آنلاین',
        'mode.pvp': '👥 دو نفره (روی یک کیبورد)',
        'mode.bot': '🤖 تک نفره با ربات',
        'mode.easy': 'آسان',
        'mode.medium': 'متوسط',
        'mode.hard': 'سخت',
        'mode.insane': 'دیوانه‌وار',
        
        'map.arena': 'آرنا',
        'map.arena_desc': 'مپ کلاسیک و متوازن',
        'map.maze': 'پیچ در پیچ',
        'map.maze_desc': 'پر از راه‌های پیچیده',
        'map.castle': 'قلعه',
        'map.castle_desc': 'مپ متقارن با قلعه مرکزی',
        'map.space': 'فضا',
        'map.space_desc': 'موانع پراکنده و آزاد',
        'map.jungle': 'جنگل',
        'map.jungle_desc': 'موانع متراکم و طبیعی',
        'map.random': 'تصادفی',
        'map.random_desc': 'مپ تصادفی تولید می‌شود',
        
        'custom.title': '🎨 شخصی‌سازی کاراکترها',
        'custom.player1': 'بازیکن ۱',
        'custom.player2': 'بازیکن ۲',
        'custom.custom_color': 'رنگ سفارشی',
        'custom.shape': 'شکل آدمک',
        
        'settings.title': '⚙️ تنظیمات',
        'settings.sound': '🔊 صدای بازی',
        'settings.music': '🎵 موسیقی پس‌زمینه',
        'settings.fx': '💥 شدت افکت‌ها',
        'settings.fx_low': 'کم',
        'settings.fx_medium': 'متوسط',
        'settings.fx_high': 'زیاد',
        'settings.win_score': '🏆 امتیاز پیروزی',
        'settings.kills': 'کشتن',
        'settings.touch': '📱 کنترل لمسی',
        'settings.minimap': '🗺️ مینی‌مپ',
        'settings.language': '🌐 زبان',
        
        'help.title': '❓ راهنمای بازی',
        'help.movement': 'حرکت',
        'help.shoot': 'شلیک',
        'help.shop': 'فروشگاه',
        'help.dash': 'فرار سریع',
        'help.grenade': 'نارنجک',
        'help.pause': '⏸️ مکث',
        
        'game.player1': 'بازیکن ۱',
        'game.player2': 'بازیکن ۲',
        'game.bot': 'ربات',
        'game.score': 'امتیاز',
        'game.coins': 'سکه',
        'game.kills': 'کشته‌ها',
        'game.wins': 'برنده شد!',
        'game.winner': 'برنده شد!',
        
        'fx.damage': 'آسیب',
        'fx.heal': 'درمان',
        'fx.blocked': 'مسدود شد!',
        'fx.shield': 'سپر!',
        'fx.level_up': 'لول آپ!',
        'fx.bonus': 'پاداش',
        'fx.upgrade': '✨ ارتقا!',
        'fx.speed': '⚡ سرعت!',
        'fx.triple': '🔫 سه‌تیر!',
        'fx.rapid': '🔥 شلیک سریع!',
        'fx.invisible': '👻 نامرئی!',
        'fx.respawn': 'در حال احیا...',
        
        'streak.double': 'دو کشته!',
        'streak.triple': 'سه کشته!',
        'streak.ultra': 'اولترا!',
        'streak.rampage': 'رَمپیج!',
        'streak.unstoppable': 'غیرقابل توقف!',
        
        'shop.p1_title': '🛒 فروشگاه P1',
        'shop.p2_title': '🛒 فروشگاه P2',
        'shop.damage': '💪 آسیب +۵',
        'shop.speed': '🏃 سرعت +۰.۵',
        'shop.bullet': '🚀 سرعت تیر +۲',
        'shop.heal': '❤️ جان +۳۰',
        'shop.triple': '🔫 سه‌تیر',
        'shop.shield': '🛡️ سپر قوی',
        'shop.hint': 'درمان از طریق ستاره‌های روی نقشه',
        
        'online.title': '🌐 بازی آنلاین',
        'online.subtitle': 'به دوستانت وصل شو و باهاشون بازی کن!',
        'online.public': '🌍 سرورهای عمومی',
        'online.create': '🛠️ ساخت سرور',
        'online.join': '🔑 ورود با کد',
        'online.server_name': '🖥️ اسم سرور',
        'online.private': '🔒 خصوصی (در لیست دیده نمی‌شود)',
        'online.custom_code': '🔑 کد سفارشی (اختیاری)',
        'online.create_btn': '🛠️ ساخت سرور',
        'online.join_btn': 'ورود به سرور',
        'online.refresh': '🔄 بروزرسانی',
        'online.empty': '🌌 سرور عمومی فعال نیست<br>اولین سرور رو بساز!',
        'online.loading': 'در حال بارگذاری...',
        'online.my_name': '👤 اسم تو',
        'online.back': 'بازگشت',
        
        'wr.title': '🎯 سرور',
        'wr.code_hint': 'کد را به دوستت بده:',
        'wr.copy': '📋 کپی کد',
        'wr.invite': '✉️ دعوت',
        'wr.ready': '✋ آماده‌ام',
        'wr.unready': '❌ لغو آمادگی',
        'wr.force_start': '🚀 شروع اجباری',
        'wr.leave': 'ترک',
        'wr.operator': '👑 اپراتور',
        'wr.guest': '👤 مهمان',
        'wr.public': '🌍 عمومی',
        'wr.private': '🔒 خصوصی',
        'wr.waiting': 'در انتظار...',
        'wr.ready_status': '✅ آماده',
        'wr.not_ready': '⏳ منتظر',
        'wr.ping': 'پینگ',
        'wr.kick': '❌ کیک',
        'wr.me': '(تو)',
        'wr.copied': 'کد کپی شد!',
        'wr.invited': '✉️ متن دعوت کپی شد!',
        'wr.kicked': '❌ توسط اپراتور کیک شدی!',
        
        'chat.placeholder': 'پیام بنویس... (Enter)',
        'chat.system': 'سیستم',
        'chat.connected': 'اتصال برقرار شد',
        'chat.disconnected': 'قطع اتصال...',
        'chat.joined': 'وارد شد',
        'chat.left': 'خارج شد',
        
        'pause.title': '⏸️ مکث',
        'pause.resume': '▶️ ادامه',
        'pause.restart': '🔄 شروع مجدد',
        'pause.menu': '🏠 منو',
        
        'gameover.title': 'پایان بازی',
        'gameover.stats': 'آمار نهایی',
        'gameover.accuracy': 'دقت',
        'gameover.play_again': '🔄 بازی مجدد',
        'gameover.main_menu': '🏠 منو',
        
        'lb.title': '🏆 برترین امتیازات',
        'lb.empty': 'هنوز رکوردی ثبت نشده!',
        'lb.clear': 'پاک کردن',
        'lb.confirm': 'آیا مطمئن هستید؟',
        
        'error.code_6': 'کد باید ۶ کاراکتر باشد',
        'error.invalid_code': 'کد معتبر نیست',
        'error.not_found': 'سرور پیدا نشد',
        'error.game_started': 'بازی در حال انجام است',
        'error.server_full': 'سرور پر است',
        'error.code_taken': 'این کد قبلاً گرفته شده',
        'error.code_format': 'کد باید ۴-۱۰ کاراکتر (حروف/اعداد) باشد',
        
        'misc.confirm': 'آیا مطمئن هستید؟',
        'misc.yes': 'بله',
        'misc.no': 'خیر'
    },
    
    de: {
        'menu.title': '⚡ NEON BATTLE ⚡',
        'menu.subtitle': 'Erweiterte Ausgabe - mit neuen Funktionen!',
        'menu.mode': '🎮 Spielmodus',
        'menu.map': '🗺️ Karte wählen',
        'menu.customize': '🎨 Anpassen',
        'menu.settings': '⚙️ Einstellungen',
        'menu.help': '❓ Hilfe',
        'menu.leaderboard': '🏆 Bestenliste',
        
        'mode.title': 'Spielmodus wählen',
        'mode.online': '🌐 Online-Spiel',
        'mode.pvp': '👥 Lokaler 2-Spieler',
        'mode.bot': '🤖 Gegen Bot spielen',
        'mode.easy': 'Leicht',
        'mode.medium': 'Mittel',
        'mode.hard': 'Schwer',
        'mode.insane': 'Wahnsinnig',
        
        'map.arena': 'Arena',
        'map.arena_desc': 'Klassische ausgewogene Karte',
        'map.maze': 'Labyrinth',
        'map.maze_desc': 'Voller gewundener Pfade',
        'map.castle': 'Schloss',
        'map.castle_desc': 'Symmetrisch mit zentralem Schloss',
        'map.space': 'Weltraum',
        'map.space_desc': 'Verteilte Hindernisse, offen',
        'map.jungle': 'Dschungel',
        'map.jungle_desc': 'Dichte natürliche Hindernisse',
        'map.random': 'Zufällig',
        'map.random_desc': 'Zufällig generierte Karte',
        
        'custom.title': '🎨 Charaktere anpassen',
        'custom.player1': 'Spieler 1',
        'custom.player2': 'Spieler 2',
        'custom.custom_color': 'Benutzerdefinierte Farbe',
        'custom.shape': 'Charakterform',
        
        'settings.title': '⚙️ Einstellungen',
        'settings.sound': '🔊 Spielsound',
        'settings.music': '🎵 Hintergrundmusik',
        'settings.fx': '💥 Effektstärke',
        'settings.fx_low': 'Niedrig',
        'settings.fx_medium': 'Mittel',
        'settings.fx_high': 'Hoch',
        'settings.win_score': '🏆 Siegpunkte',
        'settings.kills': 'Kills',
        'settings.touch': '📱 Touch-Steuerung',
        'settings.minimap': '🗺️ Minikarte',
        'settings.language': '🌐 Sprache',
        
        'help.title': '❓ Spielanleitung',
        'help.movement': 'Bewegung',
        'help.shoot': 'Schießen',
        'help.shop': 'Shop',
        'help.dash': 'Dash',
        'help.grenade': 'Granate',
        'help.pause': '⏸️ Pause',
        
        'game.player1': 'Spieler 1',
        'game.player2': 'Spieler 2',
        'game.bot': 'Bot',
        'game.score': 'Punkte',
        'game.coins': 'Münzen',
        'game.kills': 'Kills',
        'game.wins': 'gewinnt!',
        'game.winner': 'gewinnt!',
        
        'fx.damage': 'Schaden',
        'fx.heal': 'Heilung',
        'fx.blocked': 'Blockiert!',
        'fx.shield': 'Schild!',
        'fx.level_up': 'LEVEL UP!',
        'fx.bonus': 'Bonus',
        'fx.upgrade': '✨ Upgrade!',
        'fx.speed': '⚡ Geschwindigkeit!',
        'fx.triple': '🔫 Dreifach!',
        'fx.rapid': '🔥 Schnell!',
        'fx.invisible': '👻 Unsichtbar!',
        'fx.respawn': 'Respawning...',
        
        'streak.double': 'Double Kill!',
        'streak.triple': 'Triple Kill!',
        'streak.ultra': 'Ultra Kill!',
        'streak.rampage': 'RAMPAGE!',
        'streak.unstoppable': 'UNSTOPPABLE!',
        
        'shop.p1_title': '🛒 S1 Shop',
        'shop.p2_title': '🛒 S2 Shop',
        'shop.damage': '💪 Schaden +5',
        'shop.speed': '🏃 Tempo +0,5',
        'shop.bullet': '🚀 Kugeltempo +2',
        'shop.heal': '❤️ Heilung +30',
        'shop.triple': '🔫 Dreifach-Schuss',
        'shop.shield': '🛡️ Superschild',
        'shop.hint': 'Heilung durch Sterne auf der Karte',
        
        'online.title': '🌐 Online-Spiel',
        'online.subtitle': 'Verbinde dich mit Freunden!',
        'online.public': '🌍 Öffentliche Server',
        'online.create': '🛠️ Server erstellen',
        'online.join': '🔑 Mit Code beitreten',
        'online.server_name': '🖥️ Servername',
        'online.private': '🔒 Privat (nicht in Liste)',
        'online.custom_code': '🔑 Benutzerdefinierter Code',
        'online.create_btn': '🛠️ Server erstellen',
        'online.join_btn': 'Beitreten',
        'online.refresh': '🔄 Aktualisieren',
        'online.empty': '🌌 Keine aktiven Server<br>Erstelle den ersten!',
        'online.loading': 'Laden...',
        'online.my_name': '👤 Dein Name',
        'online.back': 'Zurück',
        
        'wr.title': '🎯 Server',
        'wr.code_hint': 'Gib diesen Code deinem Freund:',
        'wr.copy': '📋 Code kopieren',
        'wr.invite': '✉️ Einladen',
        'wr.ready': '✋ Bereit',
        'wr.unready': '❌ Nicht mehr bereit',
        'wr.force_start': '🚀 Sofort starten',
        'wr.leave': 'Verlassen',
        'wr.operator': '👑 Operator',
        'wr.guest': '👤 Gast',
        'wr.public': '🌍 Öffentlich',
        'wr.private': '🔒 Privat',
        'wr.waiting': 'Warten...',
        'wr.ready_status': '✅ Bereit',
        'wr.not_ready': '⏳ Warten',
        'wr.ping': 'Ping',
        'wr.kick': '❌ Kicken',
        'wr.me': '(Du)',
        'wr.copied': 'Code kopiert!',
        'wr.invited': '✉️ Einladungstext kopiert!',
        'wr.kicked': '❌ Vom Operator gekickt!',
        
        'chat.placeholder': 'Nachricht schreiben... (Enter)',
        'chat.system': 'System',
        'chat.connected': 'Verbunden',
        'chat.disconnected': 'Verbindung getrennt...',
        'chat.joined': 'ist beigetreten',
        'chat.left': 'hat verlassen',
        
        'pause.title': '⏸️ Pausiert',
        'pause.resume': '▶️ Fortsetzen',
        'pause.restart': '🔄 Neustart',
        'pause.menu': '🏠 Hauptmenü',
        
        'gameover.title': 'Spiel vorbei',
        'gameover.stats': 'Finale Statistiken',
        'gameover.accuracy': 'Genauigkeit',
        'gameover.play_again': '🔄 Nochmal spielen',
        'gameover.main_menu': '🏠 Hauptmenü',
        
        'lb.title': '🏆 Top-Punktzahlen',
        'lb.empty': 'Noch keine Rekorde!',
        'lb.clear': 'Löschen',
        'lb.confirm': 'Bist du sicher?',
        
        'error.code_6': 'Code muss 6 Zeichen haben',
        'error.invalid_code': 'Ungültiger Code',
        'error.not_found': 'Server nicht gefunden',
        'error.game_started': 'Spiel läuft bereits',
        'error.server_full': 'Server ist voll',
        'error.code_taken': 'Dieser Code ist bereits vergeben',
        'error.code_format': 'Code muss 4-10 Zeichen (Buchstaben/Zahlen) sein',
        
        'misc.confirm': 'Bist du sicher?',
        'misc.yes': 'Ja',
        'misc.no': 'Nein'
    },
    
    fr: {
        'menu.title': '⚡ BATAILLE NÉON ⚡',
        'menu.subtitle': 'Édition Avancée - Avec de Nouvelles Fonctionnalités !',
        'menu.mode': '🎮 Mode de Jeu',
        'menu.map': '🗺️ Choisir Carte',
        'menu.customize': '🎨 Personnaliser',
        'menu.settings': '⚙️ Paramètres',
        'menu.help': '❓ Aide',
        'menu.leaderboard': '🏆 Classement',
        
        'mode.title': 'Choisir Mode de Jeu',
        'mode.online': '🌐 Jeu en Ligne',
        'mode.pvp': '👥 2 Joueurs Local',
        'mode.bot': '🤖 Jouer vs Bot',
        'mode.easy': 'Facile',
        'mode.medium': 'Moyen',
        'mode.hard': 'Difficile',
        'mode.insane': 'Insensé',
        
        'map.arena': 'Arène',
        'map.arena_desc': 'Carte classique équilibrée',
        'map.maze': 'Labyrinthe',
        'map.maze_desc': 'Plein de chemins sinueux',
        'map.castle': 'Château',
        'map.castle_desc': 'Symétrique avec château central',
        'map.space': 'Espace',
        'map.space_desc': 'Obstacles dispersés, ouvert',
        'map.jungle': 'Jungle',
        'map.jungle_desc': 'Obstacles naturels denses',
        'map.random': 'Aléatoire',
        'map.random_desc': 'Carte générée aléatoirement',
        
        'custom.title': '🎨 Personnaliser Personnages',
        'custom.player1': 'Joueur 1',
        'custom.player2': 'Joueur 2',
        'custom.custom_color': 'Couleur Personnalisée',
        'custom.shape': 'Forme du Personnage',
        
        'settings.title': '⚙️ Paramètres',
        'settings.sound': '🔊 Son du Jeu',
        'settings.music': '🎵 Musique de Fond',
        'settings.fx': '💥 Intensité des Effets',
        'settings.fx_low': 'Faible',
        'settings.fx_medium': 'Moyen',
        'settings.fx_high': 'Élevé',
        'settings.win_score': '🏆 Score de Victoire',
        'settings.kills': 'kills',
        'settings.touch': '📱 Commandes Tactiles',
        'settings.minimap': '🗺️ Minicarte',
        'settings.language': '🌐 Langue',
        
        'help.title': '❓ Guide du Jeu',
        'help.movement': 'Mouvement',
        'help.shoot': 'Tirer',
        'help.shop': 'Boutique',
        'help.dash': 'Dash',
        'help.grenade': 'Grenade',
        'help.pause': '⏸️ Pause',
        
        'game.player1': 'Joueur 1',
        'game.player2': 'Joueur 2',
        'game.bot': 'Bot',
        'game.score': 'Score',
        'game.coins': 'Pièces',
        'game.kills': 'Kills',
        'game.wins': 'gagne !',
        'game.winner': 'gagne !',
        
        'fx.damage': 'Dégâts',
        'fx.heal': 'Soin',
        'fx.blocked': 'Bloqué !',
        'fx.shield': 'Bouclier !',
        'fx.level_up': 'NIVEAU SUP !',
        'fx.bonus': 'Bonus',
        'fx.upgrade': '✨ Amélioration !',
        'fx.speed': '⚡ Vitesse !',
        'fx.triple': '🔫 Triple !',
        'fx.rapid': '🔥 Rapide !',
        'fx.invisible': '👻 Invisible !',
        'fx.respawn': 'Renaissance...',
        
        'streak.double': 'Double Kill !',
        'streak.triple': 'Triple Kill !',
        'streak.ultra': 'Ultra Kill !',
        'streak.rampage': 'RAMPAGE !',
        'streak.unstoppable': 'INARRÊTABLE !',
        
        'shop.p1_title': '🛒 Boutique J1',
        'shop.p2_title': '🛒 Boutique J2',
        'shop.damage': '💪 Dégâts +5',
        'shop.speed': '🏃 Vitesse +0,5',
        'shop.bullet': '🚀 Vitesse Balle +2',
        'shop.heal': '❤️ Soin +30',
        'shop.triple': '🔫 Tir Triple',
        'shop.shield': '🛡️ Super Bouclier',
        'shop.hint': 'Soin par les étoiles sur la carte',
        
        'online.title': '🌐 Jeu en Ligne',
        'online.subtitle': 'Connecte-toi avec tes amis !',
        'online.public': '🌍 Serveurs Publics',
        'online.create': '🛠️ Créer Serveur',
        'online.join': '🔑 Rejoindre par Code',
        'online.server_name': '🖥️ Nom du Serveur',
        'online.private': '🔒 Privé (pas dans la liste)',
        'online.custom_code': '🔑 Code Personnalisé',
        'online.create_btn': '🛠️ Créer Serveur',
        'online.join_btn': 'Rejoindre',
        'online.refresh': '🔄 Rafraîchir',
        'online.empty': '🌌 Aucun serveur actif<br>Crée le premier !',
        'online.loading': 'Chargement...',
        'online.my_name': '👤 Ton Nom',
        'online.back': 'Retour',
        
        'wr.title': '🎯 Serveur',
        'wr.code_hint': 'Partage ce code avec ton ami :',
        'wr.copy': '📋 Copier Code',
        'wr.invite': '✉️ Inviter',
        'wr.ready': '✋ Prêt',
        'wr.unready': '❌ Annuler Prêt',
        'wr.force_start': '🚀 Démarrer',
        'wr.leave': 'Quitter',
        'wr.operator': '👑 Opérateur',
        'wr.guest': '👤 Invité',
        'wr.public': '🌍 Public',
        'wr.private': '🔒 Privé',
        'wr.waiting': 'En attente...',
        'wr.ready_status': '✅ Prêt',
        'wr.not_ready': '⏳ Attente',
        'wr.ping': 'Ping',
        'wr.kick': '❌ Expulser',
        'wr.me': '(Toi)',
        'wr.copied': 'Code copié !',
        'wr.invited': '✉️ Texte d\'invitation copié !',
        'wr.kicked': '❌ Expulsé par l\'opérateur !',
        
        'chat.placeholder': 'Écris un message... (Entrée)',
        'chat.system': 'Système',
        'chat.connected': 'Connecté',
        'chat.disconnected': 'Déconnecté...',
        'chat.joined': 'a rejoint',
        'chat.left': 'a quitté',
        
        'pause.title': '⏸️ En Pause',
        'pause.resume': '▶️ Reprendre',
        'pause.restart': '🔄 Redémarrer',
        'pause.menu': '🏠 Menu Principal',
        
        'gameover.title': 'Fin de Partie',
        'gameover.stats': 'Stats Finales',
        'gameover.accuracy': 'Précision',
        'gameover.play_again': '🔄 Rejouer',
        'gameover.main_menu': '🏠 Menu Principal',
        
        'lb.title': '🏆 Meilleurs Scores',
        'lb.empty': 'Pas encore de records !',
        'lb.clear': 'Effacer',
        'lb.confirm': 'Es-tu sûr ?',
        
        'error.code_6': 'Le code doit faire 6 caractères',
        'error.invalid_code': 'Code invalide',
        'error.not_found': 'Serveur introuvable',
        'error.game_started': 'Partie en cours',
        'error.server_full': 'Serveur plein',
        'error.code_taken': 'Ce code est déjà pris',
        'error.code_format': 'Code doit être 4-10 caractères (lettres/chiffres)',
        
        'misc.confirm': 'Es-tu sûr ?',
        'misc.yes': 'Oui',
        'misc.no': 'Non'
    },
    
    ar: {
        'menu.title': '⚡ معركة النيون ⚡',
        'menu.subtitle': 'النسخة المتقدمة - مع ميزات جديدة!',
        'menu.mode': '🎮 وضع اللعب',
        'menu.map': '🗺️ اختيار الخريطة',
        'menu.customize': '🎨 تخصيص',
        'menu.settings': '⚙️ الإعدادات',
        'menu.help': '❓ مساعدة',
        'menu.leaderboard': '🏆 المتصدرون',
        
        'mode.title': 'اختر وضع اللعب',
        'mode.online': '🌐 لعب عبر الإنترنت',
        'mode.pvp': '👥 لاعبان محليان',
        'mode.bot': '🤖 لعب ضد البوت',
        'mode.easy': 'سهل',
        'mode.medium': 'متوسط',
        'mode.hard': 'صعب',
        'mode.insane': 'جنوني',
        
        'map.arena': 'الساحة',
        'map.arena_desc': 'خريطة كلاسيكية متوازنة',
        'map.maze': 'المتاهة',
        'map.maze_desc': 'مليئة بالمسارات المتعرجة',
        'map.castle': 'القلعة',
        'map.castle_desc': 'متماثلة مع قلعة مركزية',
        'map.space': 'الفضاء',
        'map.space_desc': 'عقبات متناثرة ومفتوحة',
        'map.jungle': 'الغابة',
        'map.jungle_desc': 'عقبات طبيعية كثيفة',
        'map.random': 'عشوائي',
        'map.random_desc': 'خريطة مولدة عشوائياً',
        
        'custom.title': '🎨 تخصيص الشخصيات',
        'custom.player1': 'اللاعب ١',
        'custom.player2': 'اللاعب ٢',
        'custom.custom_color': 'لون مخصص',
        'custom.shape': 'شكل الشخصية',
        
        'settings.title': '⚙️ الإعدادات',
        'settings.sound': '🔊 صوت اللعبة',
        'settings.music': '🎵 موسيقى الخلفية',
        'settings.fx': '💥 شدة المؤثرات',
        'settings.fx_low': 'منخفض',
        'settings.fx_medium': 'متوسط',
        'settings.fx_high': 'عالي',
        'settings.win_score': '🏆 نقاط الفوز',
        'settings.kills': 'قتل',
        'settings.touch': '📱 التحكم باللمس',
        'settings.minimap': '🗺️ الخريطة المصغرة',
        'settings.language': '🌐 اللغة',
        
        'help.title': '❓ دليل اللعبة',
        'help.movement': 'الحركة',
        'help.shoot': 'إطلاق النار',
        'help.shop': 'المتجر',
        'help.dash': 'الاندفاع',
        'help.grenade': 'القنبلة',
        'help.pause': '⏸️ إيقاف مؤقت',
        
        'game.player1': 'اللاعب ١',
        'game.player2': 'اللاعب ٢',
        'game.bot': 'البوت',
        'game.score': 'النقاط',
        'game.coins': 'العملات',
        'game.kills': 'القتلى',
        'game.wins': 'فاز!',
        'game.winner': 'فاز!',
        
        'fx.damage': 'ضرر',
        'fx.heal': 'شفاء',
        'fx.blocked': 'تم الحظر!',
        'fx.shield': 'درع!',
        'fx.level_up': 'ارتقاء المستوى!',
        'fx.bonus': 'مكافأة',
        'fx.upgrade': '✨ ترقية!',
        'fx.speed': '⚡ سرعة!',
        'fx.triple': '🔫 ثلاثي!',
        'fx.rapid': '🔥 سريع!',
        'fx.invisible': '👻 غير مرئي!',
        'fx.respawn': 'جاري الإحياء...',
        
        'streak.double': 'قتلتان!',
        'streak.triple': 'ثلاث قتلى!',
        'streak.ultra': 'قتل فائق!',
        'streak.rampage': 'هياج!',
        'streak.unstoppable': 'لا يمكن إيقافه!',
        
        'shop.p1_title': '🛒 متجر ل١',
        'shop.p2_title': '🛒 متجر ل٢',
        'shop.damage': '💪 ضرر +٥',
        'shop.speed': '🏃 سرعة +٠.٥',
        'shop.bullet': '🚀 سرعة الرصاصة +٢',
        'shop.heal': '❤️ شفاء +٣٠',
        'shop.triple': '🔫 إطلاق ثلاثي',
        'shop.shield': '🛡️ درع خارق',
        'shop.hint': 'الشفاء عبر النجوم على الخريطة',
        
        'online.title': '🌐 لعب عبر الإنترنت',
        'online.subtitle': 'اتصل بأصدقائك والعب معهم!',
        'online.public': '🌍 خوادم عامة',
        'online.create': '🛠️ إنشاء خادم',
        'online.join': '🔑 الانضمام بالكود',
        'online.server_name': '🖥️ اسم الخادم',
        'online.private': '🔒 خاص (غير ظاهر في القائمة)',
        'online.custom_code': '🔑 كود مخصص',
        'online.create_btn': '🛠️ إنشاء خادم',
        'online.join_btn': 'انضمام',
        'online.refresh': '🔄 تحديث',
        'online.empty': '🌌 لا توجد خوادم نشطة<br>أنشئ الأول!',
        'online.loading': 'جاري التحميل...',
        'online.my_name': '👤 اسمك',
        'online.back': 'رجوع',
        
        'wr.title': '🎯 الخادم',
        'wr.code_hint': 'شارك هذا الكود مع صديقك:',
        'wr.copy': '📋 نسخ الكود',
        'wr.invite': '✉️ دعوة',
        'wr.ready': '✋ جاهز',
        'wr.unready': '❌ إلغاء الجاهزية',
        'wr.force_start': '🚀 بدء فوري',
        'wr.leave': 'مغادرة',
        'wr.operator': '👑 مشغل',
        'wr.guest': '👤 ضيف',
        'wr.public': '🌍 عام',
        'wr.private': '🔒 خاص',
        'wr.waiting': 'انتظار...',
        'wr.ready_status': '✅ جاهز',
        'wr.not_ready': '⏳ منتظر',
        'wr.ping': 'البنج',
        'wr.kick': '❌ طرد',
        'wr.me': '(أنت)',
        'wr.copied': 'تم نسخ الكود!',
        'wr.invited': '✉️ تم نسخ نص الدعوة!',
        'wr.kicked': '❌ تم طردك بواسطة المشغل!',
        
        'chat.placeholder': 'اكتب رسالة... (Enter)',
        'chat.system': 'النظام',
        'chat.connected': 'تم الاتصال',
        'chat.disconnected': 'انقطع الاتصال...',
        'chat.joined': 'انضم',
        'chat.left': 'غادر',
        
        'pause.title': '⏸️ متوقف',
        'pause.resume': '▶️ استئناف',
        'pause.restart': '🔄 إعادة البدء',
        'pause.menu': '🏠 القائمة الرئيسية',
        
        'gameover.title': 'انتهت اللعبة',
        'gameover.stats': 'الإحصائيات النهائية',
        'gameover.accuracy': 'الدقة',
        'gameover.play_again': '🔄 العب مجدداً',
        'gameover.main_menu': '🏠 القائمة الرئيسية',
        
        'lb.title': '🏆 أفضل النتائج',
        'lb.empty': 'لا توجد سجلات بعد!',
        'lb.clear': 'مسح',
        'lb.confirm': 'هل أنت متأكد؟',
        
        'error.code_6': 'يجب أن يكون الكود ٦ أحرف',
        'error.invalid_code': 'كود غير صالح',
        'error.not_found': 'الخادم غير موجود',
        'error.game_started': 'اللعبة جارية',
        'error.server_full': 'الخادم ممتلئ',
        'error.code_taken': 'هذا الكود محجوز بالفعل',
        'error.code_format': 'يجب أن يكون الكود ٤-١٠ أحرف (حروف/أرقام)',
        
        'misc.confirm': 'هل أنت متأكد؟',
        'misc.yes': 'نعم',
        'misc.no': 'لا'
    }
};

// ==================== I18N STATE ====================
let currentLanguage = localStorage.getItem('gameLanguage') || 'en';
const RTL_LANGUAGES = ['fa', 'ar'];

// ==================== CORE FUNCTIONS ====================

/**
 * ترجمه یک کلید
 * @param {string} key - کلید ترجمه
 * @param {object} params - پارامترهای جایگزینی (اختیاری)
 */
function t(key, params = {}) {
    const lang = TRANSLATIONS[currentLanguage] || TRANSLATIONS['en'];
    let text = lang[key] || TRANSLATIONS['en'][key] || key;
    
    // جایگزینی پارامترها: {name} -> Ali
    for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    }
    return text;
}

/**
 * تغییر زبان و اعمال آن
 */
function setLanguage(lang) {
    if (!TRANSLATIONS[lang]) {
        console.warn('زبان پشتیبانی نمی‌شود:', lang);
        return;
    }
    currentLanguage = lang;
    localStorage.setItem('gameLanguage', lang);
    applyTranslations();
    updateDirection();
    updateFont();
    
    // بازسازی عناصری که محتواشون با زبان عوض میشه
    if (typeof renderMapGrid === 'function') renderMapGrid();
    if (typeof renderLeaderboard === 'function') renderLeaderboard();
    if (typeof renderWaitingRoom === 'function' && currentRoom) renderWaitingRoom(currentRoom);
    if (typeof updateUI === 'function' && GameState.p1 && GameState.p2) updateUI();
}

/**
 * تنظیم جهت متن (RTL/LTR)
 */
function updateDirection() {
    const isRTL = RTL_LANGUAGES.includes(currentLanguage);
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLanguage;
    document.body.style.direction = isRTL ? 'rtl' : 'ltr';
    
    // ذخیره برای استفاده در جای دیگر
    window.IS_RTL = isRTL;
}

/**
 * تنظیم فونت مناسب برای هر زبان
 */
function updateFont() {
    const fonts = {
        'en': "'Segoe UI', Tahoma, sans-serif",
        'fa': "'Vazir', 'Tahoma', sans-serif",
        'ar': "'Tajawal', 'Arial', sans-serif",
        'de': "'Segoe UI', Tahoma, sans-serif",
        'fr': "'Segoe UI', Tahoma, sans-serif"
    };
    document.body.style.fontFamily = fonts[currentLanguage] || fonts['en'];
}

/**
 * اعمال ترجمه‌ها روی همه عناصر با data-i18n
 */
function applyTranslations() {
    // ترجمه متن‌ها
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const text = t(key);
        
        // حفظ HTML داخلی (برای ایموجی‌ها و...)
        if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = text;
        } else {
            el.textContent = text;
        }
    });
    
    // ترجمه placeholder ها
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    
    // ترجمه title ها
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
    
    // ترجمه option های select
    document.querySelectorAll('select[data-i18n-options]').forEach(select => {
        const keyBase = select.getAttribute('data-i18n-options');
        Array.from(select.options).forEach(opt => {
            if (opt.value) {
                opt.textContent = t(`${keyBase}.${opt.value}`) || opt.textContent;
            }
        });
    });
    
    console.log(`🌐 زبان تغییر کرد: ${currentLanguage.toUpperCase()}`);
}

/**
 * رندر selector زبان
 */
function renderLanguageSelector() {
    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fa', name: 'فارسی', flag: '🇮🇷' },
        { code: 'ar', name: 'العربية', flag: '🇸🇦' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' }
    ];
    
    let html = `
        <select id="language-select" onchange="setLanguage(this.value)" style="
            padding: 8px 12px;
            background: #1f2833;
            color: #c5c6c7;
            border: 1px solid #45a29e;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            direction: ltr;
        ">
    `;
    
    languages.forEach(lang => {
        const selected = currentLanguage === lang.code ? 'selected' : '';
        html += `<option value="${lang.code}" ${selected}>${lang.flag} ${lang.name}</option>`;
    });
    
    html += '</select>';
    return html;
}

/**
 * اضافه کردن selector زبان به تنظیمات
 */
function injectLanguageSelector() {
    const settingsTab = document.getElementById('tab-settings');
    if (!settingsTab) return;
    
    // چک کن قبلاً اضافه نشده باشه
    if (document.getElementById('language-row')) return;
    
    const row = document.createElement('div');
    row.className = 'setting-row';
    row.id = 'language-row';
    row.innerHTML = `
        <span class="setting-label">🌐 ${t('settings.language')}</span>
        ${renderLanguageSelector()}
    `;
    
    // اضافه کردن به ابتدای تنظیمات
    settingsTab.insertBefore(row, settingsTab.querySelector('h2').nextSibling);
}

// ==================== HELPER: ترجمه استریک‌ها ====================
function getStreakText(streak) {
    const streaks = {
        2: t('streak.double'),
        3: t('streak.triple'),
        4: t('streak.ultra'),
        5: t('streak.rampage')
    };
    if (streaks[streak]) return streaks[streak];
    if (streak > 5) return `🔥 ${streak}x ${t('streak.unstoppable')} 🔥`;
    return '';
}

// ==================== INIT ====================
// وقتی DOM آماده شد، ترجمه‌ها رو اعمال کن
function initI18n() {
    updateDirection();
    updateFont();
    applyTranslations();
    injectLanguageSelector();
    console.log('✅ سیستم i18n بارگذاری شد');
}

// اجرای خودکار
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
} else {
    initI18n();
}

// Expose به window برای استفاده در بقیه فایل‌ها
window.t = t;
window.setLanguage = setLanguage;
window.getStreakText = getStreakText;