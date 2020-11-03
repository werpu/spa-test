import {Component, OnInit} from '@angular/core';
import {VERSION} from '@angular/core';

@Component({
  selector: 'ang-app2-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ang-app2';

  ngOnInit() {
    window["sayHello"] = true;
    if (document.querySelectorAll("#in_system").length) {
      if (window["jQuery"]) { //test if jquery is present
        document.querySelectorAll("#in_system")[0].innerHTML = "Angular Version:" + VERSION.full + " jquery present";
      } else {
        document.querySelectorAll("#in_system")[0].innerHTML = "Angular Version:" + VERSION.full;
      }
    }

  }

}
