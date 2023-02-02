import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-give-up-button',
  templateUrl: './give-up-button.component.html',
  styleUrls: ['./give-up-button.component.scss']
})
export class GiveUpButtonComponent implements OnInit {
  @Input() text: string;
  @Input() color: string;
  
  constructor() { }

  ngOnInit(): void {}
}
