import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { pipeline } from '@huggingface/transformers';

@Component({
  selector: 'app-llama-llm-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './llama-llm-ai.component.html',
  styleUrl: './llama-llm-ai.component.scss',
})
export class LlamaLlmAiComponent {
  progress$ = new BehaviorSubject('initiate');
  loading$ = new BehaviorSubject(true);
  responseLoading = false;
  isWebGpuEnabled = true;
  chatLog: string[] = [];
  userInput = '';
  pipe: any;

  ngOnInit() {
    this.loadModel();
  }

  async loadModel() {
    try {
      this.pipe = await pipeline(
        'text-generation',
        'onnx-community/Llama-3.2-1B-Instruct-q4f16',
        {
          progress_callback: (progress) => {
            this.progress$.next(progress.status);
          },
        }
      );
      this.loading$.next(false);
    } catch (error) {
      console.error('Error loading model', error);
    }
  }

  async sendMessage() {
    if (
      this.userInput.trim() &&
      (!this.responseLoading || !this.isWebGpuEnabled)
    ) {
      this.responseLoading = true;
      this.chatLog.push(`You: ${this.userInput}`);
      const messages = [{ role: 'user', content: this.userInput }];

      try {
        // Trigger the response generation with streaming enabled
        const output = await this.pipe(
          [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'What is the capital of France?' },
          ],
          {
            max_new_tokens: 128,
            // do_sample: false,
            // streamer,
          }
        );
        console.log(output);
        // Mark the response as complete
        this.responseLoading = false;
        this.userInput = '';
      } catch (error) {
        this.responseLoading = false;
        console.error('Error generating response', error);
        this.chatLog.push('AI: Error generating response');
      }
    }
  }
}
