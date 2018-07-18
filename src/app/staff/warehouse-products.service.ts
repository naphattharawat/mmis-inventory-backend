import { Injectable, Inject } from '@angular/core';
import { AuthHttp } from 'angular2-jwt';
import 'rxjs/add/operator/map';

@Injectable()
export class WarehouseProductsService {

  constructor(
    @Inject('API_URL') private url: string,
    @Inject('DOC_URL') private docUrl: string,
    private authHttp: AuthHttp
  ) { }

  saveWarehouseProducts(warehouseId, products: Array<any>) {
    return new Promise((resolve, reject) => {
      this.authHttp.post(`${this.url}/warehouses/warehouseproduct`, {
        warehouseId: warehouseId,
        products: products
      })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          console.log(error);
          reject(error);
        });
    });
  }

  searchProductsWarehouse(srcwarehouseId: string, dstwarehouseId: string, query: string) {
    return new Promise((resolve, reject) => {
      this.authHttp.post(`${this.url}/warehouses/products/searchinwarehouse`, {
        query: query,
        warehouseId: srcwarehouseId,
        sourceWarehouseId: dstwarehouseId
      })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }

  saveWarehouseProductsTemplate(templateSummary, products: Array<any>) {
    return new Promise((resolve, reject) => {
      this.authHttp.post(`${this.url}/warehouses/warehouseproducttemplate`, {
        templateSummary: templateSummary,
        products: products
      })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          console.log(error);
          reject(error);
        });
    });
  }

  updateWarehouseProductsTemplate(templateId, templateSubject: any, products: Array<any>) {
    return new Promise((resolve, reject) => {
      this.authHttp.post(`${this.url}/warehouses/updatewarehouseproducttemplate`, {
        templateId: templateId,
        templateSubject: templateSubject,
        products: products
      })
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          console.log(error);
          reject(error);
        });
    });
  }

  //แสดง template ทั้งหมด
  getallTemplate() {
    return new Promise((resolve, reject) => {
      this.authHttp.get(`${this.url}/warehouses/warehouseproducttemplate`)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }

  //แสดงรายการ template ทั้งหมดใน warehouse
  getAllTemplateInWarehouse(warehouseId: any) {
    return new Promise((resolve, reject) => {
      this.authHttp.get(`${this.url}/warehouses/alltemplateinwarehouse/${warehouseId}`)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }



  getTemplateInWarehouse(warehouseId: any,sourceWarehouseId: any) {
    return new Promise((resolve, reject) => {
      this.authHttp.get(`${this.url}/warehouses/templateinwarehouse/${warehouseId}/${sourceWarehouseId}`)
        .map(res => res.json())
        .subscribe(data => {
          resolve(data);
        }, error => {
          reject(error);
        });
    });
  }


  //แสดงรายการสินค้าใน template
  getTemplate(templateId: any) {
    return new Promise((resolve, reject) => {
      this.authHttp.get(`${this.url}/warehouses/warehousetemplate/${templateId}`)
      .map(res => res.json())
      .subscribe(data => {
        resolve(data);
      }, error => {
        reject(error);
      });
    });
  }



  async removeRequisitionTemplate(templateId: any) {
    const rs: any = await this.authHttp.delete(`${this.url}/warehouses/requisition/remove-template/${templateId}`)
      .toPromise();
    return rs.json();
  }
}
