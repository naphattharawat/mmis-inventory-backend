import { AlertService } from './../../alert.service';
import { ReceiveService } from './../../admin/receive.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'wm-product-receive-other-detail',
  templateUrl: './product-receive-other-detail.component.html',
  styleUrls: ['./product-receive-other-detail.component.css']
})
export class ProductReceiveOtherDetailComponent implements OnInit {
  @Input() receiveOtherId: any;
  loading = false;
  products = [];

  constructor(private receiveService: ReceiveService, private alertService: AlertService) { }

  ngOnInit() {
    this.getProductList(this.receiveOtherId);
  }

  async getProductList(receiveOtherId) {
    this.loading = true;
    try {
      const result: any = await this.receiveService.getReceiveOtherProducts(receiveOtherId);
      this.loading = false;
      if (result.ok) {
        this.products = result.rows;
      } else {
        console.log(result.error);
        this.alertService.error();
      }
    } catch (error) {
      this.loading = false;
      this.alertService.error(error.message);
    }
  }

}
