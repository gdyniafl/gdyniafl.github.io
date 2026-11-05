/* =====================================================================
   GFL – KONFIGURACJA CAŁEJ STRONY (jedyne miejsce do edycji co sezon)
   ===================================================================== */

/* Pomocnik: buduje link CSV do konkretnej zakładki opublikowanego arkusza */
function sheet(docId, gid) {
    return 'https://docs.google.com/spreadsheets/d/e/' + docId + '/pub?gid=' + gid + '&single=true&output=csv';
}

/* ID opublikowanych arkuszy */
const DOC_ELITE     = '2PACX-1vS6zRSvbBupxKJZ47n_bC8xS8YeykvK_RDFsLh1_bH86EdlJpiJqHi2UK-CllT9igY0bo82398qTX8r';
const DOC_CHALLENGE = '2PACX-1vTA1VRwb5jvsdnc11hxIvTd1rrKLcEhdtjtWTleu7zGUNjFvwtRv4IRP_DCg8-b_q3hkobSid_TkIT3';
const DOC_ASPIRE    = '2PACX-1vTXSEavxHPPZc6MvTMg2VIyMyIRMH8UIP2ABPkstooK253hHbW2r8JgK1O-YNHCKFW8_soBcofdVKrf';
const DOC_STATY     = '2PACX-1vSbwIWnrDjc6J9nmHW8vGhMuZqSSr1X0wKPZfQ9UgZ77AM-SU0MW41ajTeEU0_uq9iX1Meg3i3s5Wrb';

const GFL_CONFIG = {

    /* Data startu bieżącego sezonu (RRRR-MM-DD).
       Do tej daty strona pokazuje komunikat o przerwie, a jako "bieżący"
       wyświetla ostatni sezon z archiwum. Od tej daty – dane na żywo z arkuszy. */
    SEASON_START: '2027-03-29',

    /* Lista sezonów – NAJNOWSZY NA GÓRZE.
       live: true  -> dane z arkuszy Google (sekcja LIVE niżej)
       sheets      -> archiwum w zakładkach Arkuszy Google (np. "MECZE SEZON II") */
    SEASONS: [
        { id: 'III', label: 'SEZON III', live: true },
        {
            id: 'II', label: 'SEZON II',
            sheets: {
                elite: {
                    mecze:   sheet(DOC_ELITE, '1249946220'),      // MECZE SEZON II
                    tabela:  sheet(DOC_ELITE, '995592118'),       // WWW SEZON II
                    druzyny: sheet(DOC_ELITE, '1237538842')       // STATYSTYKI_DRUZYN SEZON II
                },
                challenge: {
                    mecze:   sheet(DOC_CHALLENGE, '226118011'),
                    tabela:  sheet(DOC_CHALLENGE, '1801399538'),
                    druzyny: sheet(DOC_CHALLENGE, '1889062777')
                },
                aspire: {
                    mecze:   sheet(DOC_ASPIRE, '599934731'),
                    tabela:  sheet(DOC_ASPIRE, '1607044438'),
                    druzyny: sheet(DOC_ASPIRE, '432935784')
                },
                strzelcy: sheet(DOC_STATY, '419762549')        // RANKING_STRZELCOW SEZON II
            }
        }
    ],

    /* Linki do opublikowanych arkuszy (CSV) bieżącego sezonu */
    LIVE: {
        elite: {
            mecze:   sheet(DOC_ELITE, '682329859'),
            tabela:  sheet(DOC_ELITE, '1101831234'),
            druzyny: sheet(DOC_ELITE, '2106948188')
        },
        challenge: {
            mecze:   sheet(DOC_CHALLENGE, '682329859'),
            tabela:  sheet(DOC_CHALLENGE, '1101831234'),
            druzyny: sheet(DOC_CHALLENGE, '239846389')
        },
        aspire: {
            mecze:   sheet(DOC_ASPIRE, '682329859'),
            tabela:  sheet(DOC_ASPIRE, '1101831234'),
            druzyny: sheet(DOC_ASPIRE, '1718488559')
        },
        strzelcy:    sheet(DOC_STATY, '1372879295'),
        boiska:      sheet(DOC_STATY, '1111531683'),
        aktualnosci: sheet(DOC_STATY, '1840446675')
    },

    /* Zmiany nazw drużyn między sezonami: 'STARA NAZWA': 'AKTUALNA NAZWA'.
       Dzięki temu historia drużyny łączy się w jedną. Wpisuj WIELKIMI LITERAMI. */
    TEAM_ALIASES: {
        // 'KASZTELANKI': 'KURNIK KASZTELANKI',
    },

    /* Herby drużyn */
    TEAM_LOGOS: {
        "AC MISTRZOVIA GDYNIA A": "assets/images/logotypy/acmistrzovia.png",
        "AC MISTRZOVIA GDYNIA B": "assets/images/logotypy/acmistrzovia.png",
        "CISOVIA FC": "assets/images/logotypy/cisoviafc.png",
        "COCCOLINO FRESH": "assets/images/logotypy/coccolinofresh.png",
        "CWDKS MIERNIKI": "assets/images/logotypy/cwdksmierniki.png",
        "FC BARANKI": "assets/images/logotypy/fcbaranki.png",
        "FC DĘBOGÓRZE": "assets/images/logotypy/fcdebogorze.png",
        "FC GOTENHOF": "assets/images/logotypy/fcgotenhof.png",
        "FC KARWINY": "assets/images/logotypy/fckarwiny.png",
        "FC KOKONUT": "assets/images/logotypy/fckokonut.png",
        "FC ŻUBRY": "assets/images/logotypy/fczubry.png",
        "GKS CHYLONIA": "assets/images/logotypy/gkschylonia.png",
        "INAZUMA ELEVEN 2025": "assets/images/logotypy/inazuma.png",
        "J6K WITOMINO": "assets/images/logotypy/j6kwitomino.png",
        "JORDANIA SOPOT III": "assets/images/logotypy/jordaniasopot.png",
        "KKS ORŁY": "assets/images/logotypy/kksorly.png",
        "KURNIK KASZTELANKI": "assets/images/logotypy/kurnikkasztelanki.png",
        "KURNIK KASZTELANKI B": "assets/images/logotypy/kurnikkasztelanki.png",
        "LA MASSA": "assets/images/logotypy/lamassa.png",
        "FC MARION GDYNIA": "assets/images/logotypy/mariongdynia.png",
        "MORDA BUŁA": "assets/images/logotypy/mordabula.png",
        "OGARNIJ SIĘ FC": "assets/images/logotypy/ogarnijsiefc.png",
        "PAWIANY FC": "assets/images/logotypy/pawianyfc.png",
        "Q-STOSZ": "assets/images/logotypy/qstosz.png",
        "FC SIÓDEMKA7 A": "assets/images/logotypy/siodemka7a.png",
        "FC SIÓDEMKA7 B": "assets/images/logotypy/siodemka7b.png",
        "FC SIÓDEMKA7 C": "assets/images/logotypy/siodemka7c.png",
        "SPELUNO FC": "assets/images/logotypy/spelunofc.png",
        "SUVIK GDYNIA": "assets/images/logotypy/suvikgdynia.png",
        "TURBOSPRĘŻARKA C.F": "assets/images/logotypy/turbosprezarkacf.png",
        "UKS AC MATERACE": "assets/images/logotypy/uksacmaterace.png",
        "WPW WICZLINO": "assets/images/logotypy/wpwwiczlino.png",
        "ZKS ZAGÓRZAK RUMIA": "assets/images/logotypy/zksrumia.png",
        "CZARODZIEJSKIE LISY": "assets/images/logotypy/czarodziejskielisy.png",
        "ANTD FC": "assets/images/logotypy/antd.png"
    },
    DEFAULT_LOGO: 'assets/images/logo-gfl.png-160x160.png'
};
