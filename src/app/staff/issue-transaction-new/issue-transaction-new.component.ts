import { Component, OnInit, ViewChild, Inject, NgZone } from '@angular/core';
import { IMyOptions } from 'mydatepicker-th';
import { AlertService } from 'app/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';

import * as _ from 'lodash';

import { BasicService } from 'app/basic.service';
import { IssueTransactionService } from 'app/staff/issue-transaction.service';
import { PeriodService } from './../period.service';
import { UploadingService } from 'app/uploading.service';

@Component({
  selector: 'wm-issue-transaction-new',
  templateUrl: './issue-transaction-new.component.html',
  styles: []
})
export class IssueTransactionNewComponent implements OnInit {

  openUpload = false;
  fileName: any = null;
  file: any;

  products = [];
  issueDate = null;
  transactionId: null;
  issues: any = [];
  comment: any = null;
  remainQty = 0;
  lots: any = [];
  listIssues: any;
  hlistIssues: any;
  objProduct: any;

  primaryUnitId: null;
  primaryUnitName: null;
  isOpenModal = false;

  productId: any = null;
  productName: any = null;
  genericName: any = null;
  genericId: any;

  issueQty: any;
  expiredDate: any = null;
  lotNo: any;
  conversionQty = 0;
  unitGenericId: null;

  warehouseId: any;
  refDocument: any;

  @ViewChild('unitList') public unitList: any;
  @ViewChild('lotModal') public lotModal: any;
  @ViewChild('productSearch') public productSearch: any;
  @ViewChild('modalLoading') public modalLoading: any;
  @ViewChild('data') public data: any;

  myDatePickerOptions: IMyOptions = {
    inline: false,
    dateFormat: 'dd mmm yyyy',
    editableDateField: false,
    showClearDateBtn: false
  };

  jwtHelper: JwtHelper = new JwtHelper();

  constructor(
    private alertService: AlertService,
    private router: Router,
    private route: ActivatedRoute,
    private basicService: BasicService,
    private issueService: IssueTransactionService,
    private uploadingService: UploadingService,
    @Inject('API_URL') private apiUrl: string,
    private zone: NgZone,
    private periodService: PeriodService
  ) {
    const token = sessionStorage.getItem('token');
    const decodedToken: any = this.jwtHelper.decodeToken(token);
    this.warehouseId = decodedToken.warehouseId;
  }

  ngOnInit() {

    const date = new Date();

    this.issueDate = {
      date: {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
      }
    };

    this.getTransactionaIssues();
  }

  async getTransactionaIssues() {
    const rs = await this.basicService.getTransactionIssues();
    this.issues = rs.rows;
  }

  setSelectedProduct(event: any) {
    try {
      this.productId = event ? event.product_id : null;
      this.genericName = event ? `${event.generic_name}` : null;
      this.genericId = event ? event.generic_id : null;
      this.unitList.setGenericId(this.genericId);
      this.remainQty = event.qty;
    } catch (error) {
      console.log(error.message);
    }
  }

  changeUnit(event: any) {
    try {
      this.conversionQty = event.qty ? event.qty : 0;
      this.unitGenericId = event.unit_generic_id ? event.unit_generic_id : null;
    } catch (error) {
      //
    }
  }

  clearProductSearch() {
    this.productId = null;
  }

  async addProduct() {

    const idx = _.findIndex(this.products, { generic_id: this.genericId });
    if (idx > -1) {
      this.alertService.success('รายการซ้ำ', 'จำนวนจะไปเพิ่มในรายการเดิม');
      const newQty = +this.products[idx].issue_qty + +this.issueQty;
      if (newQty > +this.products[idx].remain_qty) {
        this.products[idx].issue_qty = this.products[idx].remain_qty;
      } else {
        this.products[idx].issue_qty = newQty;
      }
    } else {

      if (this.remainQty < this.issueQty) {
        this.alertService.error('จำนวนจ่าย มากกว่าจำนวน คงเหลือ');
      } else {
        const obj: any = {};
        obj.issue_qty = +this.issueQty;
        obj.generic_id = this.genericId;
        obj.generic_name = this.genericName;
        obj.remain_qty = +this.remainQty;
        obj.conversion_qty = +this.conversionQty;
        obj.unit_generic_id = this.unitGenericId;
        obj.warehouse_id = this.warehouseId;
        obj.items = [];
        this.products.push(obj);
        await this.alowcate(this.genericId);
      }
    }
    this.clearForm();
  }
  async alowcate(genericId) {
    try {
      const idx = _.findIndex(this.products, { generic_id: genericId })
      let _data = {};

      if (idx > -1) {
        _data = {
          genericId: this.products[idx].generic_id,
          genericQty: this.products[idx].issue_qty * this.products[idx].conversion_qty
        };
      }

      const data_ = [];
      data_.push(_data);

      const result: any = await this.issueService.getIssuesProduct(data_);
      if (result.ok) {
        const list = result.rows;
        const idxp = _.findIndex(this.products, { generic_id: genericId })
        if (idxp > -1) {
          this.products[idxp].items = list;
        }

      } else {
        console.log(result.error);
        this.alertService.error();
      }
    } catch (error) {
      this.alertService.error(error.message);
    }
  }

  editChangeIssueQty(idx: any, qty: any) {
    if ((+qty.value * this.products[idx].conversion_qty) > +this.products[idx].remain_qty) {
      this.alertService.error('จำนวนจ่าย มากกว่าจำนวนคงเหลือ');
      this.products[idx].issue_qty = '';
    } else {
      this.products[idx].issue_qty = +qty.value;
      this.alowcate(this.products[idx].generic_id);
    }
  }

  async editChangeUnit(idx: any, event: any, unitCmp: any) {
    if (this.products[idx].remain_qty < (this.products[idx].issue_qty * event.qty)) {
      this.products[idx].issue_qty = 0;
      this.products[idx].unit_generic_id = event.unit_generic_id;
      this.products[idx].conversion_qty = event.qty;
      unitCmp.getUnits(this.products[idx].generic_id);
    } else {
      this.products[idx].unit_generic_id = event.unit_generic_id;
      this.products[idx].conversion_qty = event.qty;
      await this.alowcate(event.generic_id);
    }
  }

  removeSelectedProduct(idx: any) {
    this.alertService.confirm('ต้องการลบรายการนี้ ใช่หรือไม่?')
      .then(() => {
        this.products.splice(idx, 1);
      }).catch(() => { });
  }

  clearForm() {
    this.remainQty = 0;
    this.issueQty = '';
    this.lotNo = null;
    this.productId = null;
    this.genericId = null;
    this.productName = null;
    this.expiredDate = null;
    this.unitGenericId = null;
    this.conversionQty = 0;

    this.unitList.clearUnits();
    this.lots = [];
    this.productSearch.clearProductSearch();
  }

  async saveIssue() {
    const issueDate = this.issueDate ? `${this.issueDate.date.year}-${this.issueDate.date.month}-${this.issueDate.date.day}` : null;
    this.modalLoading.show();
    const rs = await this.periodService.getStatus(issueDate);
    this.modalLoading.hide();
    if (rs.rows[0].status_close === 'Y') {
      this.alertService.error('ปิดรอบบัญชีแล้ว ไม่สามารถตัดจ่ายได้')
    } else {
      this.alertService.confirm('ต้องการบันทึกรายการ ตัดจ่าย ใช่หรือไม่?')
        .then(() => {
          this.modalLoading.show();
          const summary: any = {};
          summary.issueDate = this.issueDate ? `${this.issueDate.date.year}-${this.issueDate.date.month}-${this.issueDate.date.day}` : null;
          summary.transactionId = this.transactionId;
          summary.comment = this.comment;
          summary.refDocument = this.refDocument;

          // check product remain
          let isError = false;

          let _products = [];

          this.products.forEach(v => {
            if (v.issue_qty > 0) _products.push(v);
            const totalIssue = v.issue_qty * v.conversion_qty;
            if (totalIssue > v.remain_qty || v.issue_qty <= 0) {
              isError = true;
            }
          });

          if (isError) {
            this.alertService.error('มีจำนวนที่มียอดจ่ายมากกว่ายอดคงเหลือ');
            this.modalLoading.hide();
          } else {
            this.issueService.saveIssue(summary, _products)
              .then((result: any) => {
                if (result.ok) {
                  this.alertService.success();
                  this.router.navigate(['/staff/issue-transaction']);
                } else {
                  this.alertService.error(result.error);
                }
                this.modalLoading.hide();
              })
              .catch((error: any) => {
                this.modalLoading.hide();
                this.alertService.error(error.message);
              });
          }

        }).catch(() => {
          this.modalLoading.hide();
        });
    }
  }

  openModal() {
    this.isOpenModal = true;
    this.getIssues();
  }

  async getIssues() {
    try {
      const res = await this.issueService._getIssues(this.warehouseId)
      if (res.ok) {
        this.hlistIssues = res.rows;
      } else {
        this.alertService.error(res.error);
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async addIssue(id: any) {
    this.products = []
    this.isOpenModal = false;
    try {
      const res = await this.issueService.getProductIssues(id)
      if (res.ok) {
        this.objProduct = res.rows;
        for (const v of this.objProduct) {
          const obj: any = {};
          obj.issue_qty = 0;
          obj.generic_id = v.generic_id;
          obj.generic_name = v.generic_name;
          obj.remain_qty = +v.remain_qty;
          obj.conversion_qty = +v.conversion_qty;
          obj.unit_generic_id = v.unit_generic_id;
          obj.warehouse_id = this.warehouseId;
          this.products.push(obj);
          await this.alowcate(v.generic_id);
        }
      } else {
        this.alertService.error(res.error);
      }
      this.modalLoading.hide();
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  // file upload
  showUploadModal() {
    this.openUpload = true;
  }

  fileChangeEvent(fileInput: any) {
    this.file = <Array<File>>fileInput.target.files;
    this.fileName = this.file[0].name;
  }


  async doUpload() {
    try {
      this.modalLoading.show();
      const rs: any = await this.uploadingService.uploadStaffIssueTransaction(this.file[0]);
      this.modalLoading.hide();
      // clear products
      this.products = [];

      if (rs.ok) {
        const data = [];
        rs.rows.forEach(v => {
          if (v.issue_qty > 0) {
            const obj: any = {};
            obj.issue_qty = v.issue_qty;
            obj.generic_id = v.generic_id;
            obj.generic_name = v.generic_name;
            obj.remain_qty = +v.remain_qty;
            obj.conversion_qty = 1;
            obj.unit_generic_id = null;
            obj.warehouse_id = this.warehouseId;
            obj.unit_name = v.unit_name;
            obj.items = [];
            this.products.push(obj);

            data.push({
              genericId: v.generic_id,
              genericQty: v.issue_qty
            });
          }
        });

        this.getAllowcateData(data);

        this.openUpload = false;
      } else {
        this.alertService.error(JSON.stringify(rs.error));
      }

    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(JSON.stringify(error));
    }
  }

  async getAllowcateData(data) {
    const result: any = await this.issueService.getIssuesProduct(data);
    if (result.ok) {
      const list = result.rows;
      this.products.forEach((v, i) => {
        const idx = _.findIndex(list, { generic_id: v.generic_id });
        if (idx > -1) {
          this.products[i].items.push(list[idx]);
        }
      });

    } else {
      console.log(result.error);
      this.alertService.error();
    }
  }

  setSelectedGeneric(e) {
    this.products.push(e);
  }

  changeQtyGrid(e) {
    let total_base = 0;
    e.forEach(v => {
      total_base += (+v.product_qty);
    });

    const idx = _.findIndex(this.products, { generic_id: e[0].generic_id });
    if (idx > -1) {
      const qty = Math.floor(total_base / +this.products[idx].conversion_qty);
      this.products[idx].issue_qty = qty;
    }

  }
}
