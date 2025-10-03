import { Component } from '@angular/core';
import { Link } from './link/link';

@Component({
  selector: 'app-navbar',
  imports: [Link],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {}
