import { NgModule, ValueProvider }      from '@angular/core';
import { BrowserModule }                from '@angular/platform-browser';
import { HttpModule }                   from '@angular/http';
import { Ng2Bs3ModalModule }            from 'ng2-bs3-modal/ng2-bs3-modal';
import { AUTH_PROVIDERS }               from 'angular2-jwt/angular2-jwt';
import { InfiniteScrollModule }         from 'angular2-infinite-scroll/angular2-infinite-scroll';

import { AppComponent }                 from './app.component';
import { SidebarComponent }             from './components/sidebar/sidebar.component';
import { HomeComponent }                from './components/pages/home.component';
import { AboutComponent }               from './components/pages/about.component';
import { LoginComponent }               from './components/pages/login.component';
import { SignupComponent }              from './components/pages/signup.component';
import { ProfileComponent }             from './components/pages/profile.component';
import { MovieComponent }               from './components/pages/movie.component';
import { routing }                      from './app.routing';

import { TruncatePipe }                 from './components/truncate.pipe';
import { AuthGaurd }                    from './components/auth.gaurd';
import { AuthService }                  from './components/services/auth.service';
import { TRANSLATION_PROVIDERS }        from './components/translate/translate';
import { TranslatePipe }                from './components/translate/translate.pipe';
import { TranslateService }             from './components/translate/translate.service';

const WINDOW_PROVIDER: ValueProvider = {
  provide: Window,
  useValue: window
};

@NgModule({
  imports:      [ BrowserModule, 
                  routing, 
                  HttpModule, 
                  Ng2Bs3ModalModule,
                  InfiniteScrollModule ],
  declarations: [ AppComponent,
                  SidebarComponent,
                  HomeComponent,
                  AboutComponent,
                  LoginComponent,
                  SignupComponent,
                  ProfileComponent,
                  MovieComponent,
                  TruncatePipe,
                  TranslatePipe ],
  providers: [ WINDOW_PROVIDER, 
                AuthGaurd, 
                ...AUTH_PROVIDERS, 
                AuthService, 
                TRANSLATION_PROVIDERS, 
                TranslateService ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
