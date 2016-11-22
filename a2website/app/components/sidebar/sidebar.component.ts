import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '../translate/translate.service';

@Component({
  moduleId: module.id,
  selector: 'sidebar',
  templateUrl: 'sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  branding = "Hypertube";

  public translatedText: string;
  public supportedLanguages: any[];

  constructor(private auth: AuthService, private _translate: TranslateService) {
  }

  ngOnInit() {
    this.supportedLanguages = [
        { display: 'English', value: 'en' },
        { display: 'French', value: 'fr' },
        { display: 'German', value: 'de' },
    ];
    if (localStorage.getItem('selLang'))
        this.selectLang(localStorage.getItem('selLang'));
    else
        this.selectLang('en');
  }

   isCurrentLang(lang: string) {
        return lang === this._translate.currentLang;
    }

    selectLang(lang: string) {
        localStorage.setItem('selLang', lang);

        this._translate.use(lang);
        this.refreshText();
    }

    refreshText() {
        this.translatedText = this._translate.instant('hello world');
    }
}