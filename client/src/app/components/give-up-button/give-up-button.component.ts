import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-give-up-button',
  templateUrl: './give-up-button.component.html',
  styleUrls: ['./give-up-button.component.scss']
})
export class GiveUpButtonComponent implements OnInit {
  @Input() text: string;
  @Input() color: string;
  
  constructor(private router: Router) { }

  ngOnInit(): void {}

  onClick() {
    this.router.navigate(['/home']);
  }
}
