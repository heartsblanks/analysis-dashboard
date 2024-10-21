import { Component, Input } from '@angular/core';

@Component({
  selector: 'pap-bubble',
  template: `
    <div class="bubble" (click)="onClick()">
      {{ pap }}
    </div>
  `,
  styleUrls: ['./pap-bubble.component.css']
})
export class PapBubbleComponent {
  @Input() pap: string;

  onClick() {
    alert(`You selected PAP: ${this.pap}`);
  }
}
