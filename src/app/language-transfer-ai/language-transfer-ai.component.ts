import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { env, pipeline } from '@xenova/transformers';

@Component({
  selector: 'app-language-transfer-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './language-transfer-ai.component.html',
  styleUrl: './language-transfer-ai.component.scss',
})
export class LanguageTransferAiComponent {
  translator: any;
  sourceText = signal('');
  translatedText = signal('');
  loading = signal(false);
  loading$ = new BehaviorSubject(true);
  progress$ = new BehaviorSubject('initiate');
  sourceLanguage = signal('English');
  targetLanguage = signal('French');

  languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'it', label: 'Italian' },
    { value: 'pt', label: 'Portuguese' },
    { value: 'ru', label: 'Russian' },
    { value: 'zh', label: 'Chinese' },
    { value: 'ja', label: 'Japanese' },
    { value: 'ko', label: 'Korean' },
  ];

  constructor() {
    this.initModel();
  }

  async initModel() {
    env.allowLocalModels = false;
    // Using a multilingual translation model
    this.translator = await pipeline('translation', 'Xenova/m2m100_418M', {
      progress_callback: (progress: { status: string }) => {
        this.progress$.next(progress.status);
        if (progress.status === 'done') {
          console.log('Translation model loaded');
        }
      },
    });
    this.loading$.next(false);
  }

  async translate() {
    if (!this.sourceText() || this.loading()) return;

    const sourceLang =
      this.languageOptions.find((lang) => lang.label === this.sourceLanguage())
        ?.value || 'en';

    const targetLang =
      this.languageOptions.find((lang) => lang.label === this.targetLanguage())
        ?.value || 'fr';

    if (sourceLang === targetLang) {
      this.translatedText.set(
        'Please select different source and target languages.'
      );
      return;
    }

    this.loading.set(true);
    try {
      const result = await this.translator(this.sourceText(), {
        src_lang: sourceLang,
        tgt_lang: targetLang,
      });
      this.translatedText.set((result[0] as any).translation_text);
    } catch (error) {
      console.error('Translation error:', error);
      this.translatedText.set('Translation failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  swapLanguages() {
    const temp = this.sourceLanguage();
    this.sourceLanguage.set(this.targetLanguage());
    this.targetLanguage.set(temp);

    // Also swap the text
    const tempText = this.sourceText();
    this.sourceText.set(this.translatedText());
    this.translatedText.set(tempText);
  }
}
