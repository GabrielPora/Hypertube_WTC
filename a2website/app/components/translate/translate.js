"use strict";
var core_1 = require('@angular/core');
var lang_en_1 = require('./lang-en');
var lang_fr_1 = require('./lang-fr');
var lang_ger_1 = require('./lang-ger');
exports.TRANSLATIONS = new core_1.OpaqueToken('translations');
var dictionary = (_a = {},
    _a[lang_en_1.LANG_EN_NAME] = lang_en_1.LANG_EN_TRANS,
    _a[lang_fr_1.LANG_FR_NAME] = lang_fr_1.LANG_FR_TRANS,
    _a[lang_ger_1.LANG_GER_NAME] = lang_ger_1.LANG_GER_TRANS,
    _a
);
exports.TRANSLATION_PROVIDERS = [
    { provide: exports.TRANSLATIONS, useValue: dictionary },
];
var _a;
//# sourceMappingURL=translate.js.map