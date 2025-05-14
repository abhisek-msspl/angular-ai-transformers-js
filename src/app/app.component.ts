import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  // async runLLM() {
  //   env.allowLocalModels = false; // if we are using xenova/transformers we need this
  //   // Load a text-generation pipeline
  //   const generator = await pipeline('text-generation', 'Xenova/distilgpt2');
  //   // Generate text
  //   const result = await generator('Hi', {
  //     max_new_tokens: 30,
  //     do_sample: true,
  //     temperature: 0.7,
  //   });
  //   console.log(result);
  // }
}
