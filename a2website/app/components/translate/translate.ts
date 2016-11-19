import { OpaqueToken }						from '@angular/core';

import { LANG_EN_NAME, LANG_EN_TRANS }		from './lang-en';
import { LANG_FR_NAME, LANG_FR_TRANS }		from './lang-fr';
import { LANG_GER_NAME, LANG_GER_TRANS }	from './lang-ger';

export const TRANSLATIONS = new OpaqueToken('translations');

const dictionary = {
	[LANG_EN_NAME]: LANG_EN_TRANS,
	[LANG_FR_NAME]: LANG_FR_TRANS,
	[LANG_GER_NAME]: LANG_GER_TRANS
};

export const TRANSLATION_PROVIDERS = [
	{ provide: TRANSLATIONS, useValue: dictionary },
];