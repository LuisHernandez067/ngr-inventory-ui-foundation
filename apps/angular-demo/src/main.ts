/* eslint-disable @typescript-eslint/no-unsafe-call -- bootstrapApplication es de @angular/platform-browser, no instalado aún */
import 'zone.js';
import '@ngr-inventory/design-tokens/css';

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';

// Inicializa MSW en desarrollo antes de arrancar Angular
async function startApp(): Promise<void> {
  if (import.meta.env.DEV) {
    const { worker } = await import('@ngr-inventory/api-mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
  }
  await bootstrapApplication(AppComponent);
}

void startApp();
