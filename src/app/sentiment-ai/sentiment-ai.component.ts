import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { pipeline, env } from '@xenova/transformers';
import { BehaviorSubject } from 'rxjs';
// import { pipeline } from '@huggingface/transformers';

@Component({
  selector: 'app-sentiment-ai',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sentiment-ai.component.html',
  styleUrl: './sentiment-ai.component.scss',
})
export class SentimentAiComponent {
  json = JSON;
  classifier: any;
  resultText: any;
  loading$ = new BehaviorSubject(true);
  progress$ = new BehaviorSubject('initiate');

  constructor() {
    this.initClassifier();
  }

  async initClassifier() {
    env.allowLocalModels = false; // if we are using xenova/transformers we need this
    // NOTE: We attach the classifier to the global object to avoid unnecessary reloads during development
    // for xenova use  => 'sentiment-analysis' and for huggingface use => 'text-classification'
    this.classifier = (globalThis as any).classifier ??= await pipeline(
      // 'text-classification',
      'sentiment-analysis',
      'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
      {
        progress_callback: (progress: { status: string }) => {
          this.progress$.next(progress.status);
        },
      }
    );
    this.loading$.next(false);
  }

  async onChangeText(event: Event) {
    const value = (<HTMLInputElement>event.target).value;

    if (!value) {
      this.resultText = { message: 'No text provided' };
      return;
    }

    const result = await this.classifier(value);
    this.resultText = result[0];
  }
}
