import {Component, OnInit, VERSION} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ang-app3';

  ngOnInit() {
    if(window["jQuery"]) { //test if jquery is present
      document.querySelectorAll("#in_system")[0].innerHTML = "Angular Version:"+VERSION.full + " jquery present";
    } else {
      document.querySelectorAll("#in_system")[0].innerHTML = "Angular Version:"+VERSION.full;
    }
  }
}
