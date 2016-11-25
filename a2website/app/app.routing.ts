import { ModuleWithProviders } 	from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } 		from './components/pages/home.component';
import { AboutComponent } 		from './components/pages/about.component';
import { LoginComponent } 		from './components/pages/login.component';
import { SignupComponent } 		from './components/pages/signup.component';
import { ProfileComponent } 	from './components/pages/profile.component';
import { MovieComponent } 		from './components/pages/movie.component';
import { UserProfile }          from './components/pages/userProfile.component';
import { ForgotComponent } 		from './components/pages/forgot.component';
import { ResetComponent }		from './components/pages/reset.component';

import { AuthGaurd } from './components/auth.gaurd';

const appRoutes: Routes = [
	{
		path: '',
		component: LoginComponent
	},
	{
		path: 'login',
		component: LoginComponent
	},
	{
		path: 'home',
		component: HomeComponent,
		canActivate: [AuthGaurd]
	},
	{
		path: 'profile',
		component: ProfileComponent,
		canActivate: [AuthGaurd]
	},
	{
		path: 'user',
		component: UserProfile,
		canActivate: [AuthGaurd]
	},
	{
		path: 'movie',
		component: MovieComponent,
		canActivate: [AuthGaurd]
	},
	{
		path: 'about',
		component: AboutComponent
	},
	{
		path: 'signup',
		component: SignupComponent
	},
	{
		path: 'forgot',
		component: ForgotComponent
	},
	{
		path: 'reset',
		component: ResetComponent
	}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);