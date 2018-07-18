import { JwtHelper } from 'angular2-jwt';
import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { StaffService } from 'app/staff/staff.service';

@Component({
  selector: 'wm-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  warehouseId: any;
  warehouseCode: any;
  warehouseName: any;
  fullname: string;
  jwtHelper: JwtHelper = new JwtHelper();
  

  collapsible: boolean = true;
  collapse: boolean = true;
  token: any = null;

  @ViewChild('modalChangePassword') public modalChangePassword;

  constructor(private router: Router, private staffService: StaffService,@Inject('API_PORTAL_URL') private apiPortal: string) {
    this.token = sessionStorage.getItem('token');
    
  }

  ngOnInit() {
    // console.log(decoded);
    const decoded = this.jwtHelper.decodeToken(this.token);
    this.fullname = decoded.fullname;
    this.warehouseId = decoded.warehouseId;
    this.warehouseName = decoded.warehouseName;
    this.warehouseCode = decoded.warehouseCode;
    // this.getWarehouseDetail();
  }

  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('fullname');
    this.router.navigate(['/']);
  }

  openChangePasswordModal() {
    this.modalChangePassword.openModal();
  }
  showManualStaff() {
    const url = `${this.apiPortal}/pdf/ManualStaff.pdf`;
    window.open(url, '_blank');
  }
}
