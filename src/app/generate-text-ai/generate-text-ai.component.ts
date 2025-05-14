import { BehaviorSubject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { env, pipeline } from '@xenova/transformers';

@Component({
  selector: 'app-generate-text-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './generate-text-ai.component.html',
  styleUrl: './generate-text-ai.component.scss',
})
export class GenerateTextAiComponent {
  generator: any;
  prompt = signal('');
  output = signal('');
  loading = signal(false);
  isWebGpuEnabled = true;
  loading$ = new BehaviorSubject(true);
  progress$ = new BehaviorSubject('initiate');

  constructor() {
    this.initModel();
    this.checkWebGPU().then((response) => (this.isWebGpuEnabled = response));
  }

  async checkWebGPU() {
    if (!(navigator as any).gpu) {
      console.log('WebGPU is not supported on this browser.');
      return false;
    }

    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        console.log('WebGPU is supported, but no adapter found.');
        return false;
      }
      console.log('WebGPU is enabled.');
      return true;
    } catch (error) {
      console.error('An error occurred while checking WebGPU:', error);
      return false;
    }
  }

  async initModel() {
    env.allowLocalModels = false;
    this.generator = await pipeline('text-generation', 'Xenova/distilgpt2', {
      progress_callback: (progress: { status: string }) => {
        this.progress$.next(progress.status);
      },
    });
    this.loading$.next(false);
  }

  async generate() {
    if (!this.prompt() || this.loading()) return;
    this.loading.set(true);
    const result = this.generator(this.prompt(), {
      max_new_tokens: 30,
      do_sample: true,
      temperature: 0.7,
    });

    this.output.set((result[0] as any).generated_text);
    this.loading.set(false);
  }
}
