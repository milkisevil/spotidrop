import {Component} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

import 'rxjs/Rx';
import * as alertify from 'alertify';

import {MainLayout} from "./layout/main/main.component";
import {PlaylistService} from "./service/playlist.service";

@Component({
  selector: 'soundroom',
  directives: [ROUTER_DIRECTIVES],
  templateUrl: 'soundroom/soundroom.html',
  providers: [HTTP_PROVIDERS, PlaylistService]
})
@RouteConfig([
  {path: '/', name: 'MainLayout', component: MainLayout, useAsDefault: true}
])
export class SoundroomComponent {
  constructor() {

    // Global config for alertify
    alertify.logPosition("top right");
    alertify.delay(8000);

  }
}
