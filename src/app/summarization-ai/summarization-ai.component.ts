import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { env, pipeline } from '@xenova/transformers';

@Component({
  selector: 'app-summarization-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './summarization-ai.component.html',
  styleUrl: './summarization-ai.component.scss',
})
export class SummarizationAiComponent {
  generator: any;
  prompt = signal('');
  output = signal('');
  loading = signal(false);
  isWebGpuEnabled = true;
  loading$ = new BehaviorSubject(true);
  progress$ = new BehaviorSubject('initiate');

  constructor() {
    this.initModel();
  }

  async initModel() {
    env.allowLocalModels = false;
    this.generator = await pipeline(
      'summarization',
      'Xenova/distilbart-cnn-6-6',
      {
        progress_callback: (progress: { status: string }) => {
          this.progress$.next(progress.status);
        },
      }
    );
    this.loading$.next(false);
  }

  async generate() {
    if (!this.prompt() || this.loading()) return;
    this.loading.set(true);
    const result = await this.generator(this.prompt(), {
      max_new_tokens: 100,
    });
    this.output.set((result[0] as any).summary_text);
    this.loading.set(false);
  }
}
