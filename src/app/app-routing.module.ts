import {HomeComponent} from './components/home/home.component';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {PreferencesComponent} from './components/preferences/preferences.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'preferences',
    component: PreferencesComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
