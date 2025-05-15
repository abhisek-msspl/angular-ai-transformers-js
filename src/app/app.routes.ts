import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'sentiment-ai', pathMatch: 'full' },
  {
    path: 'sentiment-ai',
    loadComponent: () =>
      import('./sentiment-ai/sentiment-ai.component').then(
        (c) => c.SentimentAiComponent
      ),
  },
  {
    path: 'chat-ai',
    loadComponent: () =>
      import('./chat-ai/chat-ai.component').then((c) => c.ChatAiComponent),
  },
  // {
  //   path: 'llama-llm-ai',
  //   loadComponent: () =>
  //     import('./llama-llm-ai/llama-llm-ai.component').then(
  //       (c) => c.LlamaLlmAiComponent
  //     ),
  // },
  {
    path: 'generate-text-ai',
    loadComponent: () =>
      import('./generate-text-ai/generate-text-ai.component').then(
        (c) => c.GenerateTextAiComponent
      ),
  },
  {
    path: 'summarization-ai',
    loadComponent: () =>
      import('./summarization-ai/summarization-ai.component').then(
        (c) => c.SummarizationAiComponent
      ),
  },
];
