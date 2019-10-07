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

import { faAngleUp, faAngleRight, faAngleDown, faAngleLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'eikos-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss']
})
export class CardListComponent implements AfterViewInit {
  @ContentChild(TemplateRef, { static: false}) templateRef;
  @ViewChild('cardListGroup', { read: ElementRef, static: false }) public cardListGroup: ElementRef<any>;

  @Input() items: any[];
  @Input() title: string;
  @Input() listHeight = 500;
  @Input() cardView = false;
  @Input() inverseLayout = false;
  @Input() multiSelect = false;

  @Output() itemSelected = new EventEmitter();
  @Output() primaryActionClicked = new EventEmitter();

  selectedItems = [];
  faAngleUp = faAngleUp;
  faAngleRight = faAngleRight;
  faAngleDown = faAngleDown;
  faAngleLeft = faAngleLeft;

  constructor(private changeDetectorRef: ChangeDetectorRef) { }

  ngAfterViewInit() {
    this.changeDetectorRef.detectChanges();
  }

  showScrollUp () {
    const scrollTop = this.cardListGroup.nativeElement.scrollTop;

    return scrollTop > 0;
  }

  showScrollRight () {
    const clientWidth = this.cardListGroup.nativeElement.clientWidth;
    const scrollWidth = this.cardListGroup.nativeElement.scrollWidth;
    const scrollLeft = this.cardListGroup.nativeElement.scrollLeft;

    return clientWidth + scrollLeft < scrollWidth;
  }

  showScrollDown () {
    const clientHeight = this.cardListGroup.nativeElement.clientHeight;
    const scrollHeight = this.cardListGroup.nativeElement.scrollHeight;
    const scrollTop = this.cardListGroup.nativeElement.scrollTop;

    return clientHeight + scrollTop < scrollHeight;
  }

  showScrollLeft () {
    const scrollLeft = this.cardListGroup.nativeElement.scrollLeft;

    return scrollLeft > 0;
  }

  scrollUp () {
    const scrollAmount = this.cardListGroup.nativeElement.clientHeight * -0.5;
    const scrollToPosition = this.cardListGroup.nativeElement.scrollTop + scrollAmount;

    this.cardListGroup.nativeElement.scroll({ top: (scrollToPosition), behavior: 'smooth' });
  }

  scrollRight () {
    const scrollAmount = this.cardListGroup.nativeElement.clientWidth * 0.5;
    const scrollToPosition = this.cardListGroup.nativeElement.scrollLeft + scrollAmount;

    this.cardListGroup.nativeElement.scroll({ left: (scrollToPosition), behavior: 'smooth' });
  }

  scrollDown () {
    const scrollAmount = this.cardListGroup.nativeElement.clientHeight * 0.5;
    const scrollToPosition = this.cardListGroup.nativeElement.scrollTop + scrollAmount;

    this.cardListGroup.nativeElement.scroll({ top: (scrollToPosition), behavior: 'smooth' });
  }

  scrollLeft () {
    const scrollAmount = this.cardListGroup.nativeElement.clientWidth * -0.5;
    const scrollToPosition = this.cardListGroup.nativeElement.scrollLeft + scrollAmount;

    this.cardListGroup.nativeElement.scroll({ left: (scrollToPosition), behavior: 'smooth' });
  }

  onCardListScroll (event) {
    /* these variables are not used, but are required for scroll buttons to show/hide properly */
    const scrollTop = event.path[0].scrollTop;
    const scrollLeft = event.path[0].scrollLeft;
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
