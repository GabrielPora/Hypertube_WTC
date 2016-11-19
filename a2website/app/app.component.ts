import { Component, OnInit } from '@angular/core';
import { TranslateService } from './components/translate/translate.service';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {

  public translatedText: string;
  public supportedLanguages: any[];

  constructor(private _translate: TranslateService) { }
  
  ngOnInit() {
    this.supportedLanguages = [
        { display: 'English', value: 'en' },
        { display: 'French', value: 'fr' },
        { display: 'German', value: 'ger' },
    ];
    this.selectLang('en');
  }

   isCurrentLang(lang: string) {
        return lang === this._translate.currentLang;
    }

    selectLang(lang: string) {
        this._translate.use(lang);
        this.refreshText();
    }

    refreshText() {
        this.translatedText = this._translate.instant('hello world');
    }
}