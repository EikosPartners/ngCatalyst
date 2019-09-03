import {
  Component,
  Input,
  TemplateRef,
  ContentChild,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
  Output,
  EventEmitter
} from '@angular/core';

@Component({
  selector: 'eikos-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewInit {
  @ContentChild(TemplateRef) templateRef;
  @ViewChild('cardListGroup', { read: ElementRef }) public cardListGroup: ElementRef<any>;

  @Input() items: any[];
  @Input() title: string;
  @Input() multiSelect = false;
  @Input() showActionButtons = false;
  @Input() listHeight = 500;
  @Input() cardView = false;
  @Input() numCols = 6;

  @Output() itemSelected = new EventEmitter();
  @Output() primaryActionClicked = new EventEmitter();

  selectedItems = [];

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  showScrollUp () {
    const clientHeight = this.cardListGroup.nativeElement.clientHeight;
    const scrollTop = this.cardListGroup.nativeElement.scrollTop;

    return clientHeight >= this.listHeight && scrollTop > 0;
  }

  showScrollDown () {
    const clientHeight = this.cardListGroup.nativeElement.clientHeight;
    const scrollBottom = this.cardListGroup.nativeElement.scrollHeight -
      (this.cardListGroup.nativeElement.clientHeight + this.cardListGroup.nativeElement.scrollTop);

    return clientHeight >= this.listHeight && scrollBottom > 0;
  }

  updateScrollPosition (offset) {
    const scrollToPosition = this.cardListGroup.nativeElement.scrollTop + offset;
    this.cardListGroup.nativeElement.scroll({ top: (scrollToPosition), behavior: 'smooth' });
  }

  onCardListScroll (event) {
    /* this variable is not used, but is required for scroll buttons to show/hide properly */
    const scrollTop = event.path[0].scrollTop;
  }

  toggleSelectedItems (item) {
    const index = this.findObjectIndex(this.selectedItems, item);

    /* if item was alread selected, remove it from the selected items array */
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      if (this.multiSelect === false) {
        /* if multiSelect is disabled, first delete the other selected item */
        this.selectedItems = [];
      }
      /* add the selected item to the selected items array */
      this.selectedItems.push(item);
    }

    /* emit an event that will be handled by the component where rows are defined */
    this.itemSelected.emit(item);
  }

  findObjectIndex (arr, obj) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === obj) {
        return i;
      }
    }
    return -1;
  }

  onListItemClick (item, e) {
    /* prevent the page from scrolling to top on item click */
    e.preventDefault();
    this.toggleSelectedItems(item);
  }

  onPrimaryActionClick () {
    this.primaryActionClicked.emit(this.selectedItems);
  }

  onClearActionClick () {
    this.selectedItems = [];
  }
}
