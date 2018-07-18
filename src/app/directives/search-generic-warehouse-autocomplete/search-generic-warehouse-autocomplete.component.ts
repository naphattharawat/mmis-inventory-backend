import { Component, OnInit, Inject, Output, EventEmitter, Input } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';

@Component({
  selector: 'wm-search-generic-warehouse-autocomplete',
  templateUrl: './search-generic-warehouse-autocomplete.component.html'
})
export class SearchGenericWarehouseAutocompleteComponent implements OnInit {
  @Output('onSelect') onSelect: EventEmitter<any> = new EventEmitter<any>();
  @Output('onChange') onChange: EventEmitter<any> = new EventEmitter<any>();
  @Input('clearOnSelected') clearOnSelected: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  @Input('disabled')
  set setDisabled(value: boolean) {
    this._disabled = value;
  }
  
  @Input('warehouseId')
  set setWarehouseId(value: any) {
    this.setApiUrl(value);
  } 
  
  _disabled: boolean = false;
  _warehouseId: any;

  token: any;
  query: any = null;
  url: any;

  constructor(
    @Inject('API_URL') private apiUrl: string) {
    this.token = sessionStorage.getItem('token');
    this.url = `${this.apiUrl}/generics/warehouse/search/autocomplete?warehouseId=${this._warehouseId}&token=${this.token}`;
  }

  ngOnInit() {
  }

  setApiUrl(warehouseId: any) {
    this.url = `${this.apiUrl}/generics/warehouse/search/autocomplete?warehouseId=${warehouseId}&token=${this.token}`;
  }

  clearSearch() {
    this.query = null;
  }

  clearSelected(event: any) {
    if (this.clearOnSelected) {
      if (event.keyCode === 13 || event.keyCode === 37 || event.keyCode === 38 || event.keyCode === 39 || event.keyCode === 40) {
        this.onChange.emit(true);
      } else {
        this.onChange.emit(false);
      }
    }
  }

  handleResultSelected(event: any) {
    this.onSelect.emit(event);
    if (this.clearOnSelected) {
      this.query = null;
    } else {
      this.query = event ? event.generic_name : null;
    }
  }

}
