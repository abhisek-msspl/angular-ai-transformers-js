import { BehaviorSubject } from 'rxjs';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { pipeline, TextStreamer } from '@huggingface/transformers';

@Component({
  selector: 'app-chat-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (loading$ | async) {
    <div class="loading">
      <p>Loading model... {{ progress$ | async }}</p>
    </div>
    }
    <div class="chat-container">
      @if (responseLoading) {
      <div>message loading ..</div>
      } @for (message of chatLog; track $index) {
      <div class="chat">{{ message }}</div>
      }
      <input
        class="text-black"
        [(ngModel)]="userInput"
        (keydown.enter)="sendMessage()"
        placeholder="Type your message..."
        [disabled]="responseLoading || !!(loading$ | async)"
      />
    </div>
    @if (!isWebGpuEnabled) {
    <div class="instructions text-black">
      <h3>Enable WebGPU on Chrome:</h3>
      <ul>
        <li>Go to chrome://flags</li>
        <li>Search for 'WebGPU'</li>
        <li>Enable the WebGPU option</li>
        <li>Restart Chrome</li>
      </ul>
    </div>
    }
  `,
  styles: [
    `
      .loading {
        font-size: 22px;
        margin: 20px;
        color: #4caf50;
        text-align: center;
      }
    `,
    `
      .chat-container {
        max-width: 700px;
        margin: auto;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 12px;
        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
      }
    `,
    `
      .chat {
        padding: 10px;
        margin: 5px 0;
        border-radius: 10px;
        background-color: #e0f7fa;
        color: #006064;
        font-size: 16px;
      }
    `,
    `
      input {
        width: 100%;
        padding: 12px;
        margin: 10px 0;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 16px;
      }
    `,
    `
      .instructions {
        margin: 20px;
        padding: 10px;
        background-color: #fff3e0;
        border-radius: 8px;
      }
    `,
  ],
})
export class ChatAiComponent {
  progress$ = new BehaviorSubject('initiate');
  loading$ = new BehaviorSubject(true);
  responseLoading = false;
  isWebGpuEnabled = true;
  chatLog: string[] = [];
  userInput = '';
  pipe: any;

  ngOnInit() {
    this.loadModel();
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

  async loadModel() {
    try {
      this.pipe = await pipeline(
        'text-generation',
        'Xenova/Phi-3-mini-4k-instruct',
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

      // Initialize the response variable
      let response = '';

      // Create the streamer with a callback function to handle each chunk
      const streamer = new TextStreamer(this.pipe.tokenizer, {
        skip_prompt: true,
        callback_function: (chunk: string) => {
          // Append the chunk to the response
          response += chunk;
          console.log(response);
          // Update the chat log with the current chunk
          if (this.chatLog[this.chatLog.length - 1].startsWith('AI:')) {
            // Update the last message if it's already initialized
            this.chatLog[this.chatLog.length - 1] = `AI: ${response}`;
          } else {
            // Push the first chunk as a new message
            this.chatLog.push(`AI: ${response}`);
          }
        },
      });

      try {
        // Trigger the response generation with streaming enabled
        await this.pipe(messages, {
          max_new_tokens: 512,
          do_sample: false,
          streamer,
        });

        // Mark the response as complete
        this.responseLoading = false;
        this.userInput = '';
      } catch (error) {
        this.responseLoading = false;
        console.error('Error generating response', error);
        this.chatLog.push('AI: Error generating response');
      }
      // old approach
      // this.responseLoading = true;
      // this.chatLog.push(`You: ${this.userInput}`);
      // const messages = [{ role: 'user', content: this.userInput }];

      // const streamer = new TextStreamer(this.pipe.tokenizer, {
      //   skip_prompt: true,
      // });

      // try {
      //   const output = await this.pipe(messages, {
      //     max_new_tokens: 512,
      //     do_sample: false,
      //     streamer,
      //   });
      //   const response =
      //     output[0]?.generated_text[1].content || 'No response generated.';
      //   this.chatLog.push(`AI: ${response}`);
      //   this.responseLoading = false;
      //   this.userInput = '';
      // } catch (error) {
      //   this.responseLoading = false;
      //   console.error('Error generating response', error);
      //   this.chatLog.push('AI: Error generating response');
      // }
    }
  }
}
