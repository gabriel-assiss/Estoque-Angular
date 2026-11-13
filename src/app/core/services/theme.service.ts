import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = '@estokit:theme';
  readonly isDarkMode = signal<boolean>(false);

  constructor() {
    this.initTheme();
    // Synchronize DOM whenever isDarkMode signal changes
    effect(() => {
      const dark = this.isDarkMode();
      this.applyTheme(dark);
    });
  }

  private initTheme(): void {
    if (typeof window === 'undefined') return;

    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
  }

  toggleTheme(): void {
    const nextState = !this.isDarkMode();
    this.isDarkMode.set(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.THEME_KEY, nextState ? 'dark' : 'light');
    }
  }

  private applyTheme(dark: boolean): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (dark) {
      root.classList.add('dark');
      body.classList.add('theme-dark');
      body.classList.remove('theme-light');
    } else {
      root.classList.remove('dark');
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    }
  }
}
