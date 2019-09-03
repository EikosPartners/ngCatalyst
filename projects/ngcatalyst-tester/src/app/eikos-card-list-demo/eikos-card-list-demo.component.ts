import { Component, OnInit } from '@angular/core';

const cardListData = require('../../assets/cardListData.json');

@Component({
  selector: 'app-eikos-card-list-demo',
  styleUrls: ['./eikos-card-list-demo.component.scss'],
  template: `
    <div class="card-list-demo-container">
      <h2>Eikos Card List Demo</h2>
      <div style="display: flex;">

        <div class="card-list-demo-content" style="width: 500px;">
          <eikos-card-list
            [items]="items"
            [title]="'Limit Orders - Base View'"
            [listHeight]="500"
            [multiSelect]="true"
            [showActionButtons]="true"
            (itemSelected)="handleItemSelected($event)"
            (primaryActionClicked)="handlePrimaryAction($event)">
            <ng-template let-item="item">
              <div class="card-list-row">
                <div class="card-list-cell symbol-cell">
                  <div class="symbol-status">
                    <div class="symbol">{{ item.symbol }}</div>
                    <div class="status">
                      {{ item.fill_quantity === item.order_quantity ? "Filled" : "Open"}}
                    </div>
                  </div>
                </div>
                <div class="card-list-cell order-price-cell">
                  <div class="label">Order Price</div>
                  <div class="value">{{ item.order_price | currency }}</div>
                </div>
                <div class="card-list-cell order-quantity-cell">
                  <div class="label">Order Qty</div>
                  <div class="value">{{ item.order_quantity }}</div>
                </div>
                <div class="card-list-cell fill-quantity-cell">
                  <div class="label">Fill Qty</div>
                  <div class="value">{{ item.fill_quantity }}</div>
                </div>
                <div class="card-list-cell">
                  <div class="progress-bar">
                    <div class="progress-container">
                      <div class="progress-fill" [ngStyle]="{ 'width': (item.fill_quantity / item.order_quantity) | percent }">
                        <div class="progress-label">
                          <strong>{{ (item.fill_quantity / item.order_quantity) | percent }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ng-template>
          </eikos-card-list>
        </div>

        <div class="card-list-demo-content" style="width: 500px;">
          <eikos-card-list
            [items]="items"
            [title]="'Limit Orders - Grid View'"
            [listHeight]="500"
            [cardView]="true"
            [multiSelect]="true"
            [showActionButtons]="true"
            (itemSelected)="handleItemSelected($event)"
            (primaryActionClicked)="handlePrimaryAction($event)">
            <ng-template let-item="item">
              <div class="card-list-card">
                <div
                  class="card-list-card-shader"
                  [ngStyle]="{ 'background-color': setHslColor((item.fill_quantity / item.order_quantity * 100), 0, 120) }">
                  <div class="card-list-cell symbol-cell">
                    <div class="symbol-status">
                      <div class="symbol">{{ item.symbol }}</div>
                      <div class="status">
                        {{ item.order_price | currency }}
                      </div>
                    </div>
                  </div>
                  <div class="card-list-cell order-fill-cell">
                    <div>{{ (item.fill_quantity / item.order_quantity) | percent }}</div>
                    <div>{{ item.fill_quantity }} / {{ item.order_quantity }}</div>
                  </div>
                </div>
              </div>
            </ng-template>
          </eikos-card-list>
        </div>

      </div>
    </div>
  `,
})
export class EikosCardListDemoComponent implements OnInit {
  data: any[] = cardListData;
  items: any[] = this.data['items'];
  selectedOrders = [];

  constructor() { }

  ngOnInit() { }

  handleItemSelected (item) {
    // console.log("selected", item);
  }

  handlePrimaryAction (items) {
    let message = "Selected items:";

    for (let i = 0; i < items.length; i++) {
      message += "\n" + items[i].symbol;
    }

    alert(message);
  }

  setHslColor (percent, start, end) {
    const s = start,
      e = end,
      a = percent / 100,
      b = (e - s) * a,
      c = b + start;

    // return a css hsl string
    return `hsla(${c}, 100%, 50%, 0.5)`;
  }
}
