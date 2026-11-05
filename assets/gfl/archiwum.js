/* =====================================================================
   GFL – ARCHIWUM SEZONÓW 0 i I (tylko tabele końcowe)
   Format wiersza (jak na grafikach):
   [ 'DRUŻYNA', mecze, wygrane, porażki, remisy, bramki zdobyte, bramki stracone, punkty ]
   Kolejność wierszy = miejsce w tabeli.
   Punkty przepisane z oficjalnych tabel (uwzględniają ew. kary/walkowery).
   Gdy znany jest tylko bilans bramek: bramki = null, a bilans jako 9. element.
   ===================================================================== */
const GFL_ARCHIVE = {

    '0': {
        elite: [
            ['KASZTELANKI',          13, 12,  1, 0, 159,  75, 36],
            ['CZARODZIEJSKIE LISY',  13,  9,  2, 2, 143,  86, 29],
            ['TJP SA LUŹNI SOPOT',   13,  9,  2, 2, 124,  71, 29],
            ['FC ONLYFANS',          13,  8,  4, 1, 109,  60, 25],
            ['TURBOSPRĘŻARKA C.F',   13,  8,  5, 0, 115,  80, 24],
            ['Q-STOSZ',              13,  6,  5, 2,  66,  76, 19],
            ['JORDANIA SOPOT III',   13,  6,  7, 0,  94, 108, 18],
            ['GDYŃSKIE DZIKI',       13,  5,  7, 1,  73,  79, 15],
            ['GIBAS SQUAD',          13,  4,  7, 2,  95, 112, 14],
            ['GKS CHYLONIA A',       13,  4,  5, 4,  84,  88, 13],
            ['KKS ALKUS WITOMINO',   13,  3, 10, 0,  80, 148,  9],
            ['J6K WITOMINO',         13,  3, 10, 0,  78, 157,  9],
            ['WIELKIE POGÓRZE',      13,  2,  9, 2,  21,  94,  5]
        ],
        challenge: [
            ['KURNIK TUCHOMEK',      13, 12,  1, 0,  83,  28, 36],
            ['ANTD FC',              13, 10,  3, 0,  97,  64, 30],
            ['POLONIA GDYNIA',       13,  9,  3, 1,  79,  55, 28],
            ['FC KARWINY',           13,  9,  4, 0,  91,  82, 27],
            ['FC MARION GDYNIA',     13,  8,  5, 0,  80,  77, 24],
            ['POSEIDON GDYNIA',      13,  7,  6, 0, 102,  77, 21],
            ['SPELUNO FC',           13,  7,  6, 0,  90,  75, 21],
            ['FC SIÓDEMKA7 A',       13,  6,  6, 1,  83,  93, 19],
            ['GKS CHYLONIA B',       13,  6,  4, 3,  99,  74, 18],
            ['WPW WICZLINO',         13,  5,  7, 1,  96,  91, 16],
            ['PAWIANY FC',           13,  3,  8, 2,  30,  57,  8]
        ],
        aspire: [
            ['AC MISTRZOVIA GDYNIA A', 13, 13, 0, 0, 148,  37, 39],
            ['DYNAMO KARWINY',       13, 12,  1, 0, 140,  42, 36],
            ['RACIBÓRZ C.F',         13, 10,  3, 0, 177,  89, 30],
            ['TORONTO FC',           13,  8,  4, 1,  86,  37, 25],
            ['FC KOKOSOWO',          13,  8,  2, 3,  92,  54, 25],
            ['INTER REDA',           13,  7,  6, 0,  93,  90, 21],
            ['FC ŻUBRY',             13,  6,  7, 0, 102, 119, 18],
            ['LA OSA MIJA',          13,  5,  6, 2,  87, 138, 15],
            ['FC SIÓDEMKA7 B',       13,  4,  7, 2,  70, 111, 14],
            ['LA MASSA',             13,  4,  9, 0, 124, 124, 12],
            ['FC COSINUS',           13,  4,  9, 0,  45,  82, 12],
            ['POMERANIA GDYNIA',     13,  3,  9, 1,  67, 140,  8]
        ],
        /* Aggressive League – tylko sezon 0; na grafice był tylko bilans bramek */
        aggressive: [
            ['ZKS ZAGÓRZAK RUMIA',     13, 8, 4, 1, null, null, 25,  58],
            ['KS GARBACI',              9, 8, 1, 0, null, null, 24,  64],
            ['MKS TRÓJKĄT BOJAŃSKI',    7, 6, 1, 0, null, null, 18,  57],
            ['FC ZIOMALE REDA',         5, 4, 1, 0, null, null, 12,   9],
            ['FC CHYLONIA',             6, 4, 2, 0, null, null, 12,  -1],
            ['AC MISTRZOVIA GDYNIA B',  9, 4, 5, 0, null, null, 12, -25],
            ['P2G PUSTKI',              6, 2, 2, 1, null, null,  7,  -7],
            ['UKS AC MATERACE',         4, 2, 2, 0, null, null,  6,  -1],
            ['SUVIK GDYNIA',            3, 1, 2, 0, null, null,  3, -30],
            ['FC SIÓDEMKA7 C',         10, 1, 9, 0, null, null,  3, -96]
        ]
    },

    'I': {
        elite: [
            ['CZARODZIEJSKIE LISY',  15, 12,  1, 0, 138,  47, 34],
            ['ANTD FC',              15, 12,  0, 1, 116,  54, 33],
            ['TURBOSPRĘŻARKA C.F',   15, 11,  2, 1,  69,  45, 33],
            ['KASZTELANKI',          15, 10,  1, 1, 123,  41, 28],
            ['FC KARWINY',           15,  9,  6, 0,  87,  80, 27],
            ['KURNIK TUCHOMEK',      15,  9,  3, 1,  51,  44, 26],
            ['FC MARION GDYNIA',     15,  8,  6, 1,  84,  73, 25],
            ['J6K WITOMINO',         15,  6,  8, 1,  60, 116, 19],
            ['JORDANIA SOPOT III',   15,  6,  8, 0,  28, 146, 17],
            ['FC ONLYFANS',          15,  5,  7, 1,  55,  47, 14],
            ['GKS CHYLONIA',         15,  4,  7, 1,  39,  60, 10],
            ['Q-STOSZ',              15,  4,  8, 0,  56, 126,  9],
            ['GDYŃSKIE DZIKI',       15,  4,  6, 0,  34,  52,  7],
            ['KKS ALKUS WITOMINO',   15,  1,  1, 1,  11,  17,  3],
            ['TJP SA LUŹNI SOPOT',   15,  0, 14, 0,   0,   0,  0],
            ['GIBAS SQUAD',          15,  0, 13, 0,   0,   3,  0]
        ],
        challenge: [
            ['COCCOLINO FRESH',      15, 14,  1, 0,  59,  43, 42],
            ['ZKS ZAGÓRZAK RUMIA',   15, 12,  3, 0, 123,  57, 36],
            ['FC SIÓDEMKA7 A',       15, 11,  3, 1,  90,  69, 34],
            ['POSEIDON GDYNIA',      15,  9,  2, 4,  51,  61, 31],
            ['WPW WICZLINO',         15, 10,  3, 1,  90,  71, 30],
            ['AC MISTRZOVIA GDYNIA A', 15, 10, 4, 0,  84,  71, 29],
            ['FC KOKOSOWO',          15,  4,  4, 1,  29,  56,  7],
            ['DYNAMO KARWINY',       15,  3,  6, 1,  24,  24,  5],
            ['GDYŃSKIE ORŁY',        15,  3,  8, 0,  50,  81,  5],
            ['RACIBÓRZ C.F',         15,  3,  5, 0,  34,  26,  2],
            ['PAWIANY FC',           15,  2,  9, 0,   2,   9,  2],
            ['INTER REDA',           15,  0, 15, 0,   0,   0,  0],
            ['LUŹNA PIĄTKA',         15,  2,  5, 1,  14,  27,  0],
            ['ZK KAMIONKA',          15,  1,  7, 1,  18,  23, -2],
            ['WIELKIE POGÓRZE',      15,  1,  6, 0,  11,  31, -5],
            ['SPELUNO FC',           15,  1,  5, 0,  11,  41, -6]
        ],
        aspire: [
            ['OGARNIJ SIĘ FC',       15, 15,  0, 0, 163,  61, 45],
            ['FC GOTENHOF',          15, 14,  1, 0, 149,  69, 42],
            ['AC MISTRZOVIA GDYNIA B', 15, 10, 5, 0, 141, 128, 30],
            ['CWDKS MIERNIKI',       15,  9,  4, 2, 125, 114, 29],
            ['KKS ORŁY',             15,  8,  5, 2,  91,  83, 26],
            ['FC ŻUBRY',             15,  8,  5, 1, 113, 102, 24],
            ['FC SIÓDEMKA7 B',       15,  7,  6, 1, 112, 113, 21],
            ['FC KOKONUT',           15,  5,  7, 2, 108, 101, 16],
            ['MKS TRÓJKĄT BOJAŃSKI', 15,  6,  5, 1,  50,  74, 16],
            ['FC LAXA',              15,  5, 10, 0,  69,  36, 15],
            ['FC ZABÓJCZE PACHOŁKI', 15,  5,  9, 0,  49,  96, 14],
            ['LA MASSA',             15,  4,  8, 1,  70, 106, 11],
            ['UKS AC MATERACE',      15,  4, 10, 0,  52, 114, 11],
            ['FC QUERICO',           15,  4,  9, 0,  43,  61, 10],
            ['SUVIK GDYNIA',         15,  2, 12, 1,  51,  72,  7],
            ['DZWIEDZIE GDYNIA',     15,  2, 12, 1,  94, 150,  7]
        ]
    }
};
