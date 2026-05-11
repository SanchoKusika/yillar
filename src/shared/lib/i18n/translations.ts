import type { Language } from "@entities/preferences";

export type TranslationKey =
  | "tagline"
  | "nav.home"
  | "nav.profile"
  | "nav.auth"
  | "era.klassika"
  | "era.kasseta"
  | "era.tsifra"
  | "era.short.klassika"
  | "era.short.kasseta"
  | "era.short.tsifra"
  | "roster.playerPrefix"
  | "profile.decadeFormat"
  | "home.live"
  | "home.demo"
  | "home.headerLeft"
  | "home.button.loading"
  | "home.button.failed"
  | "home.button.needPlayers"
  | "home.button.pickGenerations"
  | "home.button.begin"
  | "roster.heading"
  | "roster.you"
  | "roster.enterName"
  | "roster.optional"
  | "roster.lockedTitle"
  | "roster.hint"
  | "auth.headerLeft"
  | "auth.headerSignIn"
  | "auth.headerSignUp"
  | "auth.signedIn"
  | "auth.guest"
  | "auth.signIn"
  | "auth.demoNotice"
  | "auth.tabSignIn"
  | "auth.tabSignUp"
  | "auth.fieldName"
  | "auth.fieldEmail"
  | "auth.fieldPassword"
  | "auth.btnSignIn"
  | "auth.btnSignUp"
  | "auth.btnGuest"
  | "auth.guestHint"
  | "auth.successConfirmed"
  | "auth.emailSentPrefix"
  | "auth.emailSentSuffix"
  | "auth.migrationNotice"
  | "auth.forgotPassword"
  | "auth.forgotHint"
  | "auth.btnSendReset"
  | "auth.resetSentPrefix"
  | "auth.resetSentSuffix"
  | "auth.backToSignIn"
  | "auth.resetHeader"
  | "auth.newPassword"
  | "auth.confirmPassword"
  | "auth.passwordMismatch"
  | "auth.btnSetPassword"
  | "auth.passwordUpdated"
  | "auth.resetInvalidLink"
  | "game.skip"
  | "game.lockIn"
  | "game.turn"
  | "game.cardOf"
  | "song.dossier"
  | "song.case"
  | "song.caseEmpty"
  | "song.classified"
  | "timeline.title"
  | "timeline.placed"
  | "timeline.drop"
  | "timeline.here"
  | "audio.muted"
  | "reveal.declassified"
  | "reveal.cardLabel"
  | "reveal.trackNo"
  | "reveal.eraMultiplier"
  | "reveal.youGuessed"
  | "reveal.offBy"
  | "reveal.points"
  | "reveal.years"
  | "reveal.base"
  | "reveal.timesEra"
  | "reveal.equalsPts"
  | "reveal.nextCard"
  | "reveal.perfectHeader"
  | "reveal.cardOfTotal"
  | "reveal.exactStamp"
  | "reveal.offByZero"
  | "reveal.bonusExact"
  | "reveal.rejectedHeader"
  | "reveal.rejectedStamp"
  | "reveal.rejectedSub"
  | "reveal.forRecord"
  | "reveal.pointsAwarded"
  | "profile.headerLeft"
  | "profile.notSignedIn"
  | "profile.member"
  | "profile.guestUpper"
  | "profile.statusGuest"
  | "profile.statusMember"
  | "profile.noGeneration"
  | "profile.memberSubtitle"
  | "profile.statBest"
  | "profile.statAvg"
  | "profile.statPlayed"
  | "profile.loading"
  | "profile.loadingPage"
  | "profile.eraBreakdown"
  | "profile.uniqueGuessed"
  | "profile.tracksWord"
  | "profile.bestDecade"
  | "profile.songsWord"
  | "profile.wins"
  | "profile.lastSessions"
  | "profile.players"
  | "profile.winnerStar"
  | "profile.leaderboardWeek"
  | "profile.zeroFriends"
  | "profile.uploadFailed"
  | "profile.saveFailed"
  | "profile.signedOut.title"
  | "profile.signedOut.body"
  | "profile.signedOut.cta"
  | "profile.guestBanner"
  | "profile.guestSubtitle"
  | "profile.history.empty"
  | "profile.bestDecade.empty"
  | "profile.friends.emptyTitle"
  | "profile.friends.emptySoon"
  | "profile.friends.emptyBody"
  | "profile.friends.invite"
  | "profile.demoMode"
  | "profile.signOut"
  | "profile.createAccount"
  | "profile.settings.theme"
  | "profile.settings.language"
  | "profile.settings.themeDark"
  | "profile.settings.themeLight"
  | "profile.settings.avatar"
  | "profile.settings.avatarHint"
  | "profile.settings.displayName"
  | "profile.settings.generation"
  | "profile.settings.upload"
  | "profile.settings.replace"
  | "profile.settings.uploading"
  | "profile.settings.save"
  | "profile.settings.saved"
  | "profile.settings.saving"
  | "profile.settings.changePassword"
  | "profile.settings.savePassword"
  | "profile.tabs.stats"
  | "profile.tabs.history"
  | "profile.tabs.friends"
  | "profile.tabs.settings"
  | "profile.placeBadge"
  | "end.headerFinal"
  | "end.winner"
  | "end.points"
  | "end.gen"
  | "end.perPlayer"
  | "end.playersCount"
  | "end.bonusGen"
  | "end.share"
  | "end.replay"
  | "end.back"
  | "end.notSaved"
  | "end.saved"
  | "end.saving"
  | "end.saveFailed"
  | "end.preparing"
  | "end.placeBadge"
  | "end.newRecord"
  | "pwa.newVersion"
  | "pwa.update"
  | "pwa.dismiss"
  | "pwa.offlineReady";

type TranslationDict = Record<TranslationKey, string>;

const ru: TranslationDict = {
  tagline: "Игра в годы · Мультиплеер",
  "nav.home": "ГЛАВНАЯ",
  "nav.profile": "ПРОФИЛЬ",
  "nav.auth": "ВХОД",
  "era.klassika": "КЛАССИКА",
  "era.kasseta": "КАССЕТА",
  "era.tsifra": "ЦИФРА",
  "era.short.klassika": "КЛАСС",
  "era.short.kasseta": "КАСС",
  "era.short.tsifra": "ЦИФР",
  "roster.playerPrefix": "И",
  "profile.decadeFormat": "{n}-е",
  "home.live": "● ЖИВОЙ КАТАЛОГ",
  "home.demo": "● ДЕМО-РЕЖИМ",
  "home.headerLeft": "MMXXVI · АРХИВ ТАШКЕНТА",
  "home.button.loading": "ЗАГРУЗКА…",
  "home.button.failed": "ОШИБКА ЗАГРУЗКИ",
  "home.button.needPlayers": "НУЖНО ≥ 2 ИГРОКОВ",
  "home.button.pickGenerations": "ВЫБЕРИТЕ ЭПОХИ",
  "home.button.begin": "СТАРТ · {n} ИГРОКОВ →",
  "roster.heading": "СОСТАВ",
  "roster.you": "ВЫ",
  "roster.enterName": "ИМЯ",
  "roster.optional": "(НЕОБЯЗАТЕЛЬНО)",
  "roster.lockedTitle": "Имя берётся из профиля. Изменить — на странице профиля.",
  "roster.hint":
    "Эпоха задаёт бонус. Выберите ту, на которой выросли — за угаданные песни этого десятилетия будет ×3 очков.",
  "auth.headerLeft": "MMXXVI · ДОСТУП",
  "auth.headerSignIn": "Вход в аккаунт",
  "auth.headerSignUp": "Регистрация",
  "auth.signedIn": "● ВЫ В СИСТЕМЕ",
  "auth.guest": "● ГОСТЬ",
  "auth.signIn": "● ВХОД",
  "auth.demoNotice":
    "Авторизация недоступна в ДЕМО-РЕЖИМЕ — задайте Supabase ключи в .env.local",
  "auth.tabSignIn": "ВХОД",
  "auth.tabSignUp": "РЕГИСТРАЦИЯ",
  "auth.fieldName": "ИМЯ",
  "auth.fieldEmail": "EMAIL",
  "auth.fieldPassword": "ПАРОЛЬ",
  "auth.btnSignIn": "ВОЙТИ →",
  "auth.btnSignUp": "СОЗДАТЬ АККАУНТ →",
  "auth.btnGuest": "ПРОДОЛЖИТЬ КАК ГОСТЬ",
  "auth.guestHint":
    "Гость может играть и сохранять историю. При регистрации позже история перенесётся.",
  "auth.successConfirmed": "АККАУНТ СОЗДАН · ДОБРО ПОЖАЛОВАТЬ",
  "auth.emailSentPrefix": "ПИСЬМО ОТПРАВЛЕНО НА",
  "auth.emailSentSuffix": "· ПЕРЕЙДИТЕ ПО ССЫЛКЕ ДЛЯ ПОДТВЕРЖДЕНИЯ",
  "auth.migrationNotice": "ИСТОРИЯ ПАРТИЙ ПЕРЕНЕСЕНА · ВЫ В СИСТЕМЕ",
  "auth.forgotPassword": "Забыли пароль?",
  "auth.forgotHint": "Введите email — мы отправим ссылку для сброса пароля.",
  "auth.btnSendReset": "ОТПРАВИТЬ ССЫЛКУ →",
  "auth.resetSentPrefix": "ССЫЛКА ОТПРАВЛЕНА НА",
  "auth.resetSentSuffix": "· ПРОВЕРЬТЕ ПОЧТУ",
  "auth.backToSignIn": "← ВЕРНУТЬСЯ КО ВХОДУ",
  "auth.resetHeader": "Сброс пароля",
  "auth.newPassword": "НОВЫЙ ПАРОЛЬ",
  "auth.confirmPassword": "ПОДТВЕРДИТЬ ПАРОЛЬ",
  "auth.passwordMismatch": "Пароли не совпадают",
  "auth.btnSetPassword": "СОХРАНИТЬ ПАРОЛЬ →",
  "auth.passwordUpdated": "ПАРОЛЬ ОБНОВЛЁН · ДОБРО ПОЖАЛОВАТЬ",
  "auth.resetInvalidLink": "Ссылка недействительна или устарела — запросите новую.",
  "game.skip": "ПРОПУСК",
  "game.lockIn": "ЗАФИКСИРОВАТЬ · {year} →",
  "game.turn": "ХОД",
  "game.cardOf": "КАРТА {idx} / {total}",
  "song.dossier": "ДОСЬЕ · В АРХИВЕ",
  "song.case": "ДЕЛО № {n}",
  "song.caseEmpty": "ДЕЛО № —",
  "song.classified": "ЗАСЕКРЕЧЕНО · ГОД",
  "timeline.title": "ВАША ШКАЛА · {name}",
  "timeline.placed": "{n} РАЗМЕЩЕНО",
  "timeline.drop": "ТАЩИ",
  "timeline.here": "СЮДА",
  "audio.muted": "ТОЛЬКО ЗВУК · ИСТОЧНИК СКРЫТ",
  "reveal.declassified": "РАССЕКРЕЧЕНО",
  "reveal.cardLabel": "КАРТА · {name}",
  "reveal.trackNo": "Трек #{id}",
  "reveal.eraMultiplier": "МНОЖИТЕЛЬ ЭПОХИ",
  "reveal.youGuessed": "ВАШ ОТВЕТ",
  "reveal.offBy": "РАЗНИЦА",
  "reveal.points": "ОЧКИ",
  "reveal.years": "Г",
  "reveal.base": "БАЗА {n}",
  "reveal.timesEra": "× ЭПОХА {n}",
  "reveal.equalsPts": "= {n} ОЧК",
  "reveal.nextCard": "СЛЕД. КАРТА · {name} →",
  "reveal.perfectHeader": "★ ИДЕАЛЬНО · {name}",
  "reveal.cardOfTotal": "КАРТА {idx} / {total}",
  "reveal.exactStamp": "В ТОЧКУ.",
  "reveal.offByZero": "РАЗНИЦА · 0 ЛЕТ",
  "reveal.bonusExact": "+ ТОЧНО {n}",
  "reveal.rejectedHeader": "● ОТКЛОНЕНО · {name}",
  "reveal.rejectedStamp": "ОТКЛОНЕНО",
  "reveal.rejectedSub": "ОТВЕТА НЕТ · ХОД ПРОПУЩЕН",
  "reveal.forRecord": "ДЛЯ СПРАВКИ",
  "reveal.pointsAwarded": "НАЧИСЛЕНО ОЧКОВ",
  "profile.headerLeft": "MMXXVI · ПРОФИЛЬ",
  "profile.notSignedIn": "● НЕ В СИСТЕМЕ",
  "profile.member": "УЧАСТНИК",
  "profile.guestUpper": "ГОСТЬ",
  "profile.statusGuest": "● ГОСТЬ",
  "profile.statusMember": "● УЧАСТНИК",
  "profile.noGeneration": "БЕЗ ЭПОХИ",
  "profile.memberSubtitle": "УЧАСТНИК · MMXXVI",
  "profile.statBest": "РЕКОРД",
  "profile.statAvg": "СРЕДН",
  "profile.statPlayed": "СЫГРАНО",
  "profile.loading": "ЗАГРУЗКА…",
  "profile.loadingPage": "Загрузка…",
  "profile.eraBreakdown": "РАЗБИВКА ПО ЭПОХАМ",
  "profile.uniqueGuessed": "УНИК. УГАДАНО",
  "profile.tracksWord": "ТРЕКОВ",
  "profile.bestDecade": "ЛУЧШИЕ ГОДЫ",
  "profile.songsWord": "ПЕСЕН",
  "profile.wins": "ПОБЕД",
  "profile.lastSessions": "ПОСЛЕДНИЕ ИГРЫ",
  "profile.players": "ИГРОКОВ",
  "profile.winnerStar": "★ ПОБЕДА",
  "profile.leaderboardWeek": "РЕЙТИНГ · НЕДЕЛЯ",
  "profile.zeroFriends": "0 ДРУЗЕЙ",
  "profile.uploadFailed": "ОШИБКА ЗАГРУЗКИ",
  "profile.saveFailed": "ОШИБКА СОХРАНЕНИЯ",
  "profile.signedOut.title": "Войдите в аккаунт",
  "profile.signedOut.body":
    "Гостевой вход или регистрация позволят сохранять историю партий.",
  "profile.signedOut.cta": "ВОЙТИ →",
  "profile.guestBanner": "ГОСТЕВОЙ РЕЖИМ · история привязана к этому браузеру.",
  "profile.guestSubtitle": "ГОСТЬ · MMXXVI",
  "profile.history.empty": "Сыграйте первую партию — она появится здесь.",
  "profile.bestDecade.empty":
    "Сыграйте больше — нужно минимум одно десятилетие с 3+ карточками.",
  "profile.friends.emptyTitle": "Список друзей пуст",
  "profile.friends.emptySoon": "СКОРО · В СЛЕДУЮЩЕЙ СБОРКЕ",
  "profile.friends.emptyBody":
    "Здесь будет недельный рейтинг, статус online и приглашения по нику.",
  "profile.friends.invite": "+ ПРИГЛАСИТЬ ДРУГА",
  "profile.demoMode": "ДЕМО-РЕЖИМ · история не сохраняется",
  "profile.signOut": "ВЫЙТИ",
  "profile.createAccount": "СОЗДАТЬ АККАУНТ →",
  "profile.settings.theme": "ТЕМА",
  "profile.settings.language": "ЯЗЫК",
  "profile.settings.themeDark": "ТЁМНАЯ · INK",
  "profile.settings.themeLight": "СВЕТЛАЯ · PAPER",
  "profile.settings.avatar": "АВАТАР",
  "profile.settings.avatarHint": "PNG · JPEG · WEBP, до 2 МБ",
  "profile.settings.displayName": "ИМЯ",
  "profile.settings.generation": "ЭПОХА",
  "profile.settings.upload": "ЗАГРУЗИТЬ",
  "profile.settings.replace": "ЗАМЕНИТЬ",
  "profile.settings.uploading": "ЗАГРУЗКА…",
  "profile.settings.save": "СОХРАНИТЬ",
  "profile.settings.saved": "СОХРАНЕНО",
  "profile.settings.saving": "СОХРАНЯЕМ…",
  "profile.settings.changePassword": "СМЕНИТЬ ПАРОЛЬ",
  "profile.settings.savePassword": "СОХРАНИТЬ ПАРОЛЬ →",
  "profile.tabs.stats": "СТАТЫ",
  "profile.tabs.history": "ИСТОРИЯ",
  "profile.tabs.friends": "ДРУЗЬЯ",
  "profile.tabs.settings": "НАСТРОЙКИ",
  "profile.placeBadge": "{n} МЕСТО",
  "end.headerFinal": "ФИНАЛ · {placed} / {total}",
  "end.winner": "★ ПОБЕДИТЕЛЬ",
  "end.points": "ОЧКОВ",
  "end.gen": "ПОК ·",
  "end.perPlayer": "РАЗБИВКА ПО ИГРОКАМ",
  "end.playersCount": "{n} ИГРОКОВ",
  "end.bonusGen": "ПОКОЛЕНИЕ · {era} ×3 БОНУС",
  "end.share": "ПОДЕЛИТЬСЯ",
  "end.replay": "ПОВТОР →",
  "end.back": "НАЗАД",
  "end.notSaved": "● НЕ СОХРАНЕНО",
  "end.saved": "● СОХРАНЕНО",
  "end.saving": "● СОХРАНЯЕМ…",
  "end.saveFailed": "● ОШИБКА СОХР",
  "end.preparing": "● ПОДГОТОВКА",
  "end.placeBadge": "{n} МЕСТО",
  "end.newRecord": "★ НОВЫЙ РЕКОРД",
  "pwa.newVersion": "НОВАЯ ВЕРСИЯ ГОТОВА",
  "pwa.update": "ОБНОВИТЬ",
  "pwa.dismiss": "Скрыть",
  "pwa.offlineReady": "ГОТОВО К ОФЛАЙН-ИГРЕ",
};

const uz: TranslationDict = {
  tagline: "Yillar o'yini · Ko'p o'yinchi",
  "nav.home": "BOSH",
  "nav.profile": "PROFIL",
  "nav.auth": "KIRISH",
  "era.klassika": "KLASSIKA",
  "era.kasseta": "KASSETA",
  "era.tsifra": "RAQAMLI",
  "era.short.klassika": "KLAS",
  "era.short.kasseta": "KASS",
  "era.short.tsifra": "RAQ",
  "roster.playerPrefix": "O",
  "profile.decadeFormat": "{n}-yillar",
  "home.live": "● JONLI KATALOG",
  "home.demo": "● DEMO REJIM",
  "home.headerLeft": "MMXXVI · TOSHKENT ARXIVI",
  "home.button.loading": "YUKLANMOQDA…",
  "home.button.failed": "YUKLASH XATOSI",
  "home.button.needPlayers": "≥ 2 O'YINCHI KERAK",
  "home.button.pickGenerations": "AVLODNI TANLANG",
  "home.button.begin": "BOSHLASH · {n} O'YINCHI →",
  "roster.heading": "TARKIB",
  "roster.you": "SIZ",
  "roster.enterName": "ISM",
  "roster.optional": "(IXTIYORIY)",
  "roster.lockedTitle": "Ism profildan olinadi. O'zgartirish — profil sahifasida.",
  "roster.hint":
    "Avlod — bonus uchun. O'zingiz ulg'aygan davrni tanlang — o'sha o'n yillik kartalari uchun ×3 ochko.",
  "auth.headerLeft": "MMXXVI · KIRISH",
  "auth.headerSignIn": "Hisobga kirish",
  "auth.headerSignUp": "Ro'yxatdan o'tish",
  "auth.signedIn": "● TIZIMDA",
  "auth.guest": "● MEHMON",
  "auth.signIn": "● KIRISH",
  "auth.demoNotice":
    "DEMO REJIMda avtorizatsiya ishlamaydi — .env.local ichida Supabase kalitlarini bering",
  "auth.tabSignIn": "KIRISH",
  "auth.tabSignUp": "RO'YXAT",
  "auth.fieldName": "ISM",
  "auth.fieldEmail": "EMAIL",
  "auth.fieldPassword": "PAROL",
  "auth.btnSignIn": "KIRISH →",
  "auth.btnSignUp": "HISOB OCHISH →",
  "auth.btnGuest": "MEHMON SIFATIDA DAVOM ETISH",
  "auth.guestHint":
    "Mehmon ham o'ynashi va tarixni saqlashi mumkin. Keyinroq ro'yxatdan o'tganda tarix ko'chiriladi.",
  "auth.successConfirmed": "HISOB OCHILDI · XUSH KELIBSIZ",
  "auth.emailSentPrefix": "XAT YUBORILDI:",
  "auth.emailSentSuffix": "· TASDIQLASH UCHUN HAVOLAGA O'TING",
  "auth.migrationNotice": "O'YIN TARIXI KO'CHIRILDI · TIZIMDASIZ",
  "auth.forgotPassword": "Parolni unutdingizmi?",
  "auth.forgotHint": "Email kiriting — tiklash havolasini yuboramiz.",
  "auth.btnSendReset": "HAVOLA YUBORISH →",
  "auth.resetSentPrefix": "HAVOLA YUBORILDI:",
  "auth.resetSentSuffix": "· POCHTANGIZNI TEKSHIRING",
  "auth.backToSignIn": "← KIRISHGA QAYTISH",
  "auth.resetHeader": "Parolni tiklash",
  "auth.newPassword": "YANGI PAROL",
  "auth.confirmPassword": "PAROLNI TASDIQLASH",
  "auth.passwordMismatch": "Parollar mos emas",
  "auth.btnSetPassword": "PAROLNI SAQLASH →",
  "auth.passwordUpdated": "PAROL YANGILANDI · XUSH KELIBSIZ",
  "auth.resetInvalidLink": "Havola yaroqsiz yoki eskirgan — yangisini so'rang.",
  "game.skip": "O'TKAZIB YUBOR",
  "game.lockIn": "TASDIQLASH · {year} →",
  "game.turn": "NAVBAT",
  "game.cardOf": "KARTA {idx} / {total}",
  "song.dossier": "DOSYE · ARXIVDA",
  "song.case": "ISH № {n}",
  "song.caseEmpty": "ISH № —",
  "song.classified": "MAXFIY · YIL",
  "timeline.title": "SIZNING SHKALA · {name}",
  "timeline.placed": "{n} JOYLASHTIRILDI",
  "timeline.drop": "TASHLA",
  "timeline.here": "BU YERGA",
  "audio.muted": "FAQAT AUDIO · MANBA YASHIRIN",
  "reveal.declassified": "OSHKOR ETILDI",
  "reveal.cardLabel": "KARTA · {name}",
  "reveal.trackNo": "Trek #{id}",
  "reveal.eraMultiplier": "AVLOD KO'PAYTIRGICHI",
  "reveal.youGuessed": "SIZNING JAVOB",
  "reveal.offBy": "FARQ",
  "reveal.points": "OCHKO",
  "reveal.years": "Y",
  "reveal.base": "BAZA {n}",
  "reveal.timesEra": "× AVLOD {n}",
  "reveal.equalsPts": "= {n} OCH",
  "reveal.nextCard": "KEYINGI KARTA · {name} →",
  "reveal.perfectHeader": "★ MUKAMMAL · {name}",
  "reveal.cardOfTotal": "KARTA {idx} / {total}",
  "reveal.exactStamp": "AYNAN.",
  "reveal.offByZero": "FARQ · 0 YIL",
  "reveal.bonusExact": "+ AYNAN {n}",
  "reveal.rejectedHeader": "● RAD ETILDI · {name}",
  "reveal.rejectedStamp": "RAD ETILDI",
  "reveal.rejectedSub": "JAVOB YO'Q · NAVBAT O'TKAZILDI",
  "reveal.forRecord": "MA'LUMOT UCHUN",
  "reveal.pointsAwarded": "BERILGAN OCHKO",
  "profile.headerLeft": "MMXXVI · PROFIL",
  "profile.notSignedIn": "● TIZIMDA EMAS",
  "profile.member": "A'ZO",
  "profile.guestUpper": "MEHMON",
  "profile.statusGuest": "● MEHMON",
  "profile.statusMember": "● A'ZO",
  "profile.noGeneration": "AVLODSIZ",
  "profile.memberSubtitle": "A'ZO · MMXXVI",
  "profile.statBest": "ENG YAXSHI",
  "profile.statAvg": "O'RT",
  "profile.statPlayed": "O'YNALDI",
  "profile.loading": "YUKLANMOQDA…",
  "profile.loadingPage": "Yuklanmoqda…",
  "profile.eraBreakdown": "AVLODLAR BO'YICHA",
  "profile.uniqueGuessed": "NOYOB TOPILGAN",
  "profile.tracksWord": "TREK",
  "profile.bestDecade": "ENG YAXSHI O'N YILLIK",
  "profile.songsWord": "QO'SHIQ",
  "profile.wins": "G'ALABA",
  "profile.lastSessions": "SO'NGI O'YINLAR",
  "profile.players": "O'YINCHI",
  "profile.winnerStar": "★ G'OLIB",
  "profile.leaderboardWeek": "REYTING · HAFTA",
  "profile.zeroFriends": "0 DO'ST",
  "profile.uploadFailed": "YUKLASH XATOSI",
  "profile.saveFailed": "SAQLASH XATOSI",
  "profile.signedOut.title": "Hisobga kiring",
  "profile.signedOut.body":
    "Mehmon yoki ro'yxatdan o'tish o'yin tarixini saqlashga yordam beradi.",
  "profile.signedOut.cta": "KIRISH →",
  "profile.guestBanner":
    "MEHMON REJIMI · tarix faqat shu brauzerga bog'langan.",
  "profile.guestSubtitle": "MEHMON · MMXXVI",
  "profile.history.empty":
    "Birinchi o'yinni o'tkazing — u shu yerda ko'rinadi.",
  "profile.bestDecade.empty":
    "Ko'proq o'ynang — kamida bitta o'n yillikda 3+ karta kerak.",
  "profile.friends.emptyTitle": "Do'stlar ro'yxati bo'sh",
  "profile.friends.emptySoon": "TEZ ORADA · KEYINGI BUILD'DA",
  "profile.friends.emptyBody":
    "Bu yerda haftalik reyting, online holat va taklifnomalar bo'ladi.",
  "profile.friends.invite": "+ DO'ST QO'SHISH",
  "profile.demoMode": "DEMO REJIM · tarix saqlanmaydi",
  "profile.signOut": "CHIQISH",
  "profile.createAccount": "HISOB OCHISH →",
  "profile.settings.theme": "MAVZU",
  "profile.settings.language": "TIL",
  "profile.settings.themeDark": "QORONG'I · INK",
  "profile.settings.themeLight": "OCH · PAPER",
  "profile.settings.avatar": "AVATAR",
  "profile.settings.avatarHint": "PNG · JPEG · WEBP, 2 MB gacha",
  "profile.settings.displayName": "ISM",
  "profile.settings.generation": "AVLOD",
  "profile.settings.upload": "YUKLASH",
  "profile.settings.replace": "ALMASHTIRISH",
  "profile.settings.uploading": "YUKLANMOQDA…",
  "profile.settings.save": "SAQLASH",
  "profile.settings.saved": "SAQLANDI",
  "profile.settings.saving": "SAQLANMOQDA…",
  "profile.settings.changePassword": "PAROLNI O'ZGARTIRISH",
  "profile.settings.savePassword": "PAROLNI SAQLASH →",
  "profile.tabs.stats": "STATISTIKA",
  "profile.tabs.history": "TARIX",
  "profile.tabs.friends": "DO'STLAR",
  "profile.tabs.settings": "SOZLAMALAR",
  "profile.placeBadge": "{n}-O'RIN",
  "end.headerFinal": "FINAL · {placed} / {total}",
  "end.winner": "★ G'OLIB",
  "end.points": "OCHKO",
  "end.gen": "AVL ·",
  "end.perPlayer": "O'YINCHILAR BO'YICHA",
  "end.playersCount": "{n} O'YINCHI",
  "end.bonusGen": "AVLOD · {era} ×3 BONUS",
  "end.share": "ULASHISH",
  "end.replay": "QAYTA →",
  "end.back": "ORQAGA",
  "end.notSaved": "● SAQLANMADI",
  "end.saved": "● SAQLANDI",
  "end.saving": "● SAQLANMOQDA…",
  "end.saveFailed": "● SAQLASH XATOSI",
  "end.preparing": "● TAYYORLANMOQDA",
  "end.placeBadge": "{n}-O'RIN",
  "end.newRecord": "★ YANGI REKORD",
  "pwa.newVersion": "YANGI VERSIYA TAYYOR",
  "pwa.update": "YANGILASH",
  "pwa.dismiss": "Yopish",
  "pwa.offlineReady": "OFFLINE REJIMGA TAYYOR",
};

const en: TranslationDict = {
  tagline: "The game of years · Multiplayer",
  "nav.home": "HOME",
  "nav.profile": "PROFILE",
  "nav.auth": "AUTH",
  "era.klassika": "CLASSIC",
  "era.kasseta": "CASSETTE",
  "era.tsifra": "DIGITAL",
  "era.short.klassika": "CLAS",
  "era.short.kasseta": "CASS",
  "era.short.tsifra": "DIGI",
  "roster.playerPrefix": "P",
  "profile.decadeFormat": "{n}s",
  "home.live": "● LIVE CATALOG",
  "home.demo": "● DEMO MODE",
  "home.headerLeft": "MMXXVI · TASHKENT ARCHIVE",
  "home.button.loading": "LOADING TRACKS…",
  "home.button.failed": "FAILED TO LOAD",
  "home.button.needPlayers": "NEED ≥ 2 PLAYERS",
  "home.button.pickGenerations": "PICK GENERATIONS",
  "home.button.begin": "BEGIN · {n} PLAYERS →",
  "roster.heading": "REGISTER PLAYERS",
  "roster.you": "YOU",
  "roster.enterName": "ENTER NAME",
  "roster.optional": "(OPTIONAL)",
  "roster.lockedTitle": "Name comes from profile. Edit it on the profile screen.",
  "roster.hint":
    "Generation sets the scoring bias. Pick the era you grew up with — you'll score ×3 on your decades.",
  "auth.headerLeft": "MMXXVI · ACCESS",
  "auth.headerSignIn": "Sign in to your account",
  "auth.headerSignUp": "Create account",
  "auth.signedIn": "● SIGNED IN",
  "auth.guest": "● GUEST",
  "auth.signIn": "● SIGN IN",
  "auth.demoNotice":
    "Auth is unavailable in DEMO MODE — set Supabase keys in .env.local",
  "auth.tabSignIn": "SIGN IN",
  "auth.tabSignUp": "SIGN UP",
  "auth.fieldName": "DISPLAY NAME",
  "auth.fieldEmail": "EMAIL",
  "auth.fieldPassword": "PASSWORD",
  "auth.btnSignIn": "SIGN IN →",
  "auth.btnSignUp": "CREATE ACCOUNT →",
  "auth.btnGuest": "CONTINUE AS GUEST",
  "auth.guestHint":
    "Guest can play and save history. If you register later, the history will be migrated.",
  "auth.successConfirmed": "ACCOUNT CREATED · WELCOME",
  "auth.emailSentPrefix": "EMAIL SENT TO",
  "auth.emailSentSuffix": "· FOLLOW THE LINK TO CONFIRM",
  "auth.migrationNotice": "GAME HISTORY MIGRATED · YOU ARE SIGNED IN",
  "auth.forgotPassword": "Forgot password?",
  "auth.forgotHint": "Enter your email — we'll send a reset link.",
  "auth.btnSendReset": "SEND RESET LINK →",
  "auth.resetSentPrefix": "RESET LINK SENT TO",
  "auth.resetSentSuffix": "· CHECK YOUR INBOX",
  "auth.backToSignIn": "← BACK TO SIGN IN",
  "auth.resetHeader": "Reset password",
  "auth.newPassword": "NEW PASSWORD",
  "auth.confirmPassword": "CONFIRM PASSWORD",
  "auth.passwordMismatch": "Passwords do not match",
  "auth.btnSetPassword": "SAVE PASSWORD →",
  "auth.passwordUpdated": "PASSWORD UPDATED · WELCOME BACK",
  "auth.resetInvalidLink": "Link is invalid or expired — request a new one.",
  "game.skip": "SKIP",
  "game.lockIn": "LOCK IN · {year} →",
  "game.turn": "TURN",
  "game.cardOf": "CARD {idx} / {total}",
  "song.dossier": "DOSSIER · ON FILE",
  "song.case": "CASE № {n}",
  "song.caseEmpty": "CASE № —",
  "song.classified": "CLASSIFIED · YEAR",
  "timeline.title": "YOUR TIMELINE · {name}",
  "timeline.placed": "{n} PLACED",
  "timeline.drop": "DROP",
  "timeline.here": "HERE",
  "audio.muted": "AUDIO ONLY · SOURCE MUTED",
  "reveal.declassified": "DECLASSIFIED",
  "reveal.cardLabel": "CARD · {name}",
  "reveal.trackNo": "Track #{id}",
  "reveal.eraMultiplier": "ERA MULTIPLIER",
  "reveal.youGuessed": "YOU GUESSED",
  "reveal.offBy": "OFF BY",
  "reveal.points": "POINTS",
  "reveal.years": "YRS",
  "reveal.base": "BASE {n}",
  "reveal.timesEra": "× ERA {n}",
  "reveal.equalsPts": "= {n} PTS",
  "reveal.nextCard": "NEXT CARD · {name} →",
  "reveal.perfectHeader": "★ PERFECT · {name}",
  "reveal.cardOfTotal": "CARD {idx} / {total}",
  "reveal.exactStamp": "EXACT.",
  "reveal.offByZero": "OFF BY · 0 YRS",
  "reveal.bonusExact": "+ EXACT {n}",
  "reveal.rejectedHeader": "● REJECTED · {name}",
  "reveal.rejectedStamp": "REJECTED",
  "reveal.rejectedSub": "NO ANSWER · TURN SKIPPED",
  "reveal.forRecord": "FOR THE RECORD",
  "reveal.pointsAwarded": "POINTS AWARDED",
  "profile.headerLeft": "MMXXVI · PROFILE",
  "profile.notSignedIn": "● NOT SIGNED IN",
  "profile.member": "MEMBER",
  "profile.guestUpper": "GUEST",
  "profile.statusGuest": "● GUEST",
  "profile.statusMember": "● MEMBER",
  "profile.noGeneration": "NO GENERATION",
  "profile.memberSubtitle": "MEMBER · MMXXVI",
  "profile.statBest": "BEST",
  "profile.statAvg": "AVG",
  "profile.statPlayed": "PLAYED",
  "profile.loading": "LOADING…",
  "profile.loadingPage": "Loading…",
  "profile.eraBreakdown": "ERA BREAKDOWN",
  "profile.uniqueGuessed": "UNIQUE GUESSED",
  "profile.tracksWord": "TRACKS",
  "profile.bestDecade": "BEST DECADE",
  "profile.songsWord": "SONGS",
  "profile.wins": "WINS",
  "profile.lastSessions": "LAST SESSIONS",
  "profile.players": "PLAYERS",
  "profile.winnerStar": "★ WINNER",
  "profile.leaderboardWeek": "LEADERBOARD · WEEK",
  "profile.zeroFriends": "0 FRIENDS",
  "profile.uploadFailed": "UPLOAD FAILED",
  "profile.saveFailed": "SAVE FAILED",
  "profile.signedOut.title": "Sign in to your account",
  "profile.signedOut.body":
    "Guest sign-in or registration will let you save match history.",
  "profile.signedOut.cta": "GO TO AUTH →",
  "profile.guestBanner": "GUEST MODE · history is bound to this browser.",
  "profile.guestSubtitle": "GUEST · MMXXVI",
  "profile.history.empty": "Play your first match — it'll show up here.",
  "profile.bestDecade.empty":
    "Play more — need at least one decade with 3+ cards.",
  "profile.friends.emptyTitle": "Friends list is empty",
  "profile.friends.emptySoon": "SOON · COMING IN NEXT BUILD",
  "profile.friends.emptyBody":
    "Weekly leaderboard, online status and invites by handle will live here.",
  "profile.friends.invite": "+ INVITE FRIEND",
  "profile.demoMode": "DEMO MODE · history is not saved",
  "profile.signOut": "SIGN OUT",
  "profile.createAccount": "CREATE ACCOUNT →",
  "profile.settings.theme": "THEME",
  "profile.settings.language": "LANGUAGE",
  "profile.settings.themeDark": "DARK · INK",
  "profile.settings.themeLight": "LIGHT · PAPER",
  "profile.settings.avatar": "AVATAR",
  "profile.settings.avatarHint": "PNG · JPEG · WEBP, up to 2 MB",
  "profile.settings.displayName": "DISPLAY NAME",
  "profile.settings.generation": "GENERATION",
  "profile.settings.upload": "UPLOAD",
  "profile.settings.replace": "REPLACE",
  "profile.settings.uploading": "UPLOADING…",
  "profile.settings.save": "SAVE",
  "profile.settings.saved": "SAVED",
  "profile.settings.saving": "SAVING…",
  "profile.settings.changePassword": "CHANGE PASSWORD",
  "profile.settings.savePassword": "SAVE PASSWORD →",
  "profile.tabs.stats": "STATS",
  "profile.tabs.history": "HISTORY",
  "profile.tabs.friends": "FRIENDS",
  "profile.tabs.settings": "SETTINGS",
  "profile.placeBadge": "PLACE {n}",
  "end.headerFinal": "FINAL · {placed} / {total}",
  "end.winner": "★ WINNER",
  "end.newRecord": "★ NEW RECORD",
  "end.points": "POINTS",
  "end.gen": "GEN ·",
  "end.perPlayer": "PER-PLAYER BREAKDOWN",
  "end.playersCount": "{n} PLAYERS",
  "end.bonusGen": "GENERATION · {era} ×3 BONUS",
  "end.share": "SHARE",
  "end.replay": "REPLAY →",
  "end.back": "BACK",
  "end.notSaved": "● NOT SAVED",
  "end.saved": "● SAVED",
  "end.saving": "● SAVING…",
  "end.saveFailed": "● SAVE FAILED",
  "end.preparing": "● PREPARING",
  "end.placeBadge": "PLACE {n}",
  "pwa.newVersion": "NEW VERSION READY",
  "pwa.update": "UPDATE",
  "pwa.dismiss": "Dismiss",
  "pwa.offlineReady": "READY TO PLAY OFFLINE",
};

export const TRANSLATIONS: Record<Language, TranslationDict> = { ru, uz, en };

export const LANGUAGE_LABEL: Record<Language, string> = {
  ru: "RU · РУССКИЙ",
  uz: "UZ · O'ZBEKCHA",
  en: "EN · ENGLISH",
};
