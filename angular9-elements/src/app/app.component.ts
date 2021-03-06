import {Component, OnInit} from '@angular/core';
import { VERSION } from '@angular/core';
import * as jQuery from "jquery";


@Component({
  selector: 'ang-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ang-app';

  ngOnInit() {
    if(window["sayHello"]) {
      alert("Angular 8 said hello");
      delete window["sayHello"];
    }
    jQuery("#in_system").html("Angular Version:"+VERSION.full+" jQuery present");
  }

}
