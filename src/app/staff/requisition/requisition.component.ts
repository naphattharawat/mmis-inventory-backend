import { State } from '@clr/angular';
import { UploadingService } from './../../uploading.service';
import {
  Component,
  OnInit,
  ViewChild,
  NgZone,
  Inject,
  ChangeDetectorRef,
  EventEmitter
} from '@angular/core';

import { RequisitionTypeService } from "../requisition-type.service";
import { RequisitionService } from "../requisition.service";
import { AlertService } from "../../alert.service";

import { IMyOptions } from 'mydatepicker-th';
import { JwtHelper } from 'angular2-jwt';

import * as moment from 'moment';
import * as _ from 'lodash';
import { IRequisitionOrder } from 'app/shared';

@Component({
  selector: 'wm-requisition',
  templateUrl: './requisition.component.html'
})
export class RequisitionComponent implements OnInit {
  @ViewChild('htmlPreview') public htmlPreview: any;
  @ViewChild('modalLoading') public modalLoading: any;

  filesToUpload: Array<File> = [];
  token: any;
  orders: any = [];
  approveds: any = [];
  unpaids: any = [];
  waitingApproves: any = [];
  requisitionSelected: Array<any> = [];
  // tabSelect: any = 0;
  selectedTab: any = 'waiting';
  offset = 0;
  perPage = 15;
  currentPage = 1;

  totalUnPaid = 0;
  totalApprove = 0;
  totalWaiting = 0;
  totalWaitingApprove = 0;
  totalApproveds

  query: any;
  fillterCancel = 'nCancel';
  constructor(
    private alertService: AlertService,
    private requisitionService: RequisitionService,
    private uploadingService: UploadingService,
    private ref: ChangeDetectorRef,
    @Inject('DOC_URL') private docUrl: string,
    @Inject('REQ_PREFIX') private documentPrefix: string,
    @Inject('API_URL') private url: string,
    @Inject('API_URL') private apiUrl: string
  ) {
    this.token = sessionStorage.getItem('token');
    this.currentPage = +sessionStorage.getItem('currentPageRequisition') ? +sessionStorage.getItem('currentPageRequisition') : 1;
  }

  async ngOnInit() {
    this.loadData();
    this.selectedTab = sessionStorage.getItem('tabRequisitionStaff');

  }

  setTapActive(tab: any) {
    this.selectedTab = tab;
    sessionStorage.setItem('tabRequisitionStaff', tab);
  }

  async loadData() {
    // await this.getWaiting();
    // await this.getWaitingApprove();
    // await this.getUnPaid();
    // await this.getApproved();

  }

  async getWaiting() {
    this.modalLoading.show();
    try {
      const rs: any = await this.requisitionService.getWating(this.perPage, this.offset, this.query, this.fillterCancel);
      this.modalLoading.hide();
      if (rs.ok) {
        this.orders = rs.rows;
        this.totalWaiting = rs.total[0].total;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getUnPaid() {
    this.modalLoading.show();
    try {
      const rs: any = await this.requisitionService.getUnPaid(this.perPage, this.offset, this.query, null);
      this.modalLoading.hide();
      if (rs.ok) {
        this.unpaids = rs.rows;
        this.totalUnPaid = rs.total[0].total;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getWaitingApprove() {
    this.modalLoading.show();
    try {
      const rs: any = await this.requisitionService.getWaitingApprove(this.perPage, this.offset, this.query, this.fillterCancel);
      this.modalLoading.hide();
      if (rs.ok) {
        this.waitingApproves = rs.rows;
        this.totalWaitingApprove = rs.total[0].total;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  async getApproved() {
    this.modalLoading.show();
    try {
      const rs: any = await this.requisitionService.getApproved(this.perPage, this.offset, this.query);
      this.modalLoading.hide();
      if (rs.ok) {
        this.approveds = rs.rows;
        this.totalApprove = rs.total[0].total;
      } else {
        this.alertService.error(rs.error);
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
  }

  refreshApprove(state: State) {
    this.offset = +state.page.from;
    sessionStorage.setItem('currentPageRequisitionStaff', this.currentPage.toString());
    this.getApproved();
  }

  refreshUnPaid(state: State) {
    this.offset = +state.page.from;
    sessionStorage.setItem('currentPageRequisitionStaff', this.currentPage.toString());
    this.getUnPaid();
  }

  refreshWaitingApprove(state: State) {
    this.offset = +state.page.from;
    sessionStorage.setItem('currentPageRequisitionStaff', this.currentPage.toString());
    this.getWaitingApprove();
  }

  refreshWaiting(state: State) {
    this.offset = +state.page.from;
    sessionStorage.setItem('currentPageRequisitionStaff', this.currentPage.toString());
    this.getWaiting();
  }

  async removeOrder(order: IRequisitionOrder) {
    this.alertService.confirm('ต้องการลบรายการนี้ [' + order.requisition_code + ']')
      .then(async () => {
        this.modalLoading.show();
        try {
          const rs: any = await this.requisitionService.removeRequisitionOrder(order.requisition_order_id);
          this.modalLoading.hide();
          if (rs.ok) {
            this.alertService.success();
            this.loadData();
          } else {
            this.alertService.error(rs.error);
          }
        } catch (error) {
          this.alertService.error(error.message);
        }
      }).catch(() => {
        this.modalLoading.hide();
      });
  }

  doApprove(order: any) {
    this.alertService.confirm('ต้องการอนุมัติรายการนี้ ใช่หรือไม่?')
      .then(async () => {
        this.modalLoading.show();
        try {
          const rs: any = await this.requisitionService.saveApproveOrderConfirm(order.confirm_id);
          this.modalLoading.hide();
          if (rs.ok) {
            this.alertService.success();
            this.loadData();
          } else {
            this.alertService.error(rs.error);
          }
        } catch (error) {
          this.modalLoading.hide();
          this.alertService.error(error.message);
        }
      })
      .catch(() => {
        this.modalLoading.hide();
      });
  }
  printApprove(order: any) {
    const url = this.url + '/report/approve/requis/' + order.requisition_order_id + `?token=${this.token}`;
    this.htmlPreview.showReport(url);
  }
  printSetProduct(order: any) {
    const url = this.url + '/report/list/requis/' + order.requisition_order_id + `?token=${this.token}`;
    this.htmlPreview.showReport(url);
  }

  printUnPaid() {
    const requisition_id: any = []
    let count: any = 0
    this.requisitionSelected.forEach(e => {
      if (e.is_cancel !== 'Y') {
        requisition_id.push('requisId=' + e.requisition_order_id);
        count++;
      }
    });
    if (count > 0) {
      const url = this.url + `/report/UnPaid/requis?token=${this.token}&` + requisition_id.join('&');
      this.htmlPreview.showReport(url);
      console.log(url);

    } else {
      this.alertService.error('กรุณาเลือกรายการที่จะพิมพ์');
    }
  }

  async search() {
    try {
      this.modalLoading.show();
      this.currentPage = 1;
      if (this.selectedTab === 'waiting') {
        const rs: any = await this.requisitionService.getWating(this.perPage, 0, this.query, this.fillterCancel);
        if (rs.ok) {
          this.orders = rs.rows;
          this.totalWaiting = rs.total[0].total;
        } else {
          this.alertService.error(rs.error);
        }
      } else if (this.selectedTab === 'waitingApprove') {
        const rs: any = await this.requisitionService.getWaitingApprove(this.perPage, 0, this.query, this.fillterCancel);
        if (rs.ok) {
          this.waitingApproves = rs.rows;
          this.totalWaitingApprove = rs.total[0].total;
        } else {
          this.alertService.error(rs.error);
        }
      } else if (this.selectedTab === 'unpaid') {
        const rs: any = await this.requisitionService.getUnPaid(this.perPage, this.offset, this.query, this.fillterCancel);
        if (rs.ok) {
          this.unpaids = rs.rows;
          this.totalUnPaid = rs.total[0].total;
        } else {
          this.alertService.error(rs.error);
        }
      } else if (this.selectedTab === 'approved') {
        const rs: any = await this.requisitionService.getApproved(this.perPage, this.offset, this.query);
        if (rs.ok) {
          this.approveds = rs.rows;
          this.totalApproveds = rs.total[0].total;
        } else {
          this.alertService.error(rs.error);
        }
      }
    } catch (error) {
      this.modalLoading.hide();
      this.alertService.error(error.message);
    }
    this.modalLoading.hide();
  }

  keyUpSearch(e) {
    if (e.keyCode === 13) {
      this.search();
    } else if (this.query === '') {
      this.search();
    }
  }

  clearQuery() {
    this.query = '';
    this.search();
  }

  changeFillter() {
    if (this.selectedTab === 'waiting') {
      this.getWaiting();
    } else if (this.selectedTab === 'waitingApprove') {
      this.getWaitingApprove();
    } else if (this.selectedTab === 'unpaid') {
      this.getUnPaid();
    }
  }
}

