import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subscription } from 'rxjs';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private subscription: Subscription | null = null;
  private currentLang: string = 'en';

  constructor(
    private translationService: TranslationService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.currentLang = this.translationService.getCurrentLanguage();
    this.subscription = this.translationService.currentLanguage$.subscribe((lang) => {
      if (this.currentLang !== lang) {
        this.currentLang = lang;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  transform(key: string, params?: { [key: string]: any }): string {
    if (!key) {
      return '';
    }
    
    try {
      const result = this.translationService.translate(key, params);
      // Debug: uncomment to see translations
      // console.log(`Translate "${key}" = "${result}"`);
      return result;
    } catch (error) {
      console.error('Translation error for key:', key, error);
      return key;
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

