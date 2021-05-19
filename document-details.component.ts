
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { FormArray, FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { ServicesService } from '../service/services.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import * as moment from 'moment';
import { error } from '@angular/compiler/src/util';
// import { MatTableDataSource } from '@angular/material/table';
import { TosterService } from '../toster/toster.service';
import { MatSidenav } from '@angular/material/sidenav';
import { Platform } from '@angular/cdk/platform';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { NgxImgZoomService } from "ngx-img-zoom";
import * as $ from 'jquery';
import { MatDialog } from '@angular/material/dialog';
import { IdDetailsComponent } from './id-details/id-details.component';
import { ReportService } from '../service/report.service';
// declare var $: any;
pdfMake.vfs = pdfFonts.pdfMake.vfs;
@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDetailsComponent implements OnInit {

  @ViewChild('rightDrawer', { static: false }) sideNav: MatSidenav;
  displayedColumns: string[] = ['scanId', 'scanDate', 'status'];
  elementType: 'url';
  verificaionUrl = '';
  emailId: '';
  dataSource: any = [];
  // new MatTableDataSource();
  disabled = false;
  accessType = '';
  public id: number;
  public panelOpenState = false;
  // tslint:disable-next-line:variable-name
  public comments: any[] = [];
  public comment = '';
  // qtd: any[] = [];
  public userName = '';
  // tslint:disable-next-line:variable-name
  public ID_Type = '';
  public userId = '';
  public idCardNo = '';
  public firstName = '';
  public lastName = '';
  public dob = '';
  public streetName = '';
  public city = '';
  public postalCode = '';
  public idExpiryDate = '';
  public updatedDate = '';
  public idCardFrontStatus = '';
  public idCardBackStatus = '';
  public liveCheckingStatus = '';
  public scanResultStatus = '';
  public selfiePhotoMatchStatus = '';
  public reason = '';
  public idCardSelect = ''
  public idCardTypeComment = '';
  public addressStatus = '';
  public addressComments = '';
  public LiveCheckData = '';
  public liveCheckComments = '';
  public selefieMatchPercengates = '';
  public scanResults = '';
  public scanResultComment = '';
  public fullImageDisplay: boolean = false;
  isIdStatus = false;
  isAddressStatus = false;
  isLiveCheck = false;
  isScanResults = false;
  isOverLay = false;
  isGenerated = true;
  // mailScreen = true;
  form: FormGroup;
  dateOfBirth: any;
  document: any = [];
  scanDocument: any = [];
  scanIdDetails: any = [];
  commentsData: any = [];
  docId = '';
  scanId = '';
  resutData: any = [];
  tenent_ID = '';
  documentIdType: any = [
    // { value: 'Nationality Identify Card' },
    // { value: 'Driving Licence' },
    // { value: 'Passport' },
  ];
  idCardForntType: any = [
    { name: 'clear', value: 'clear' },
    { name: 'Not Clear', value: 'not_clear' },
  ];
  idCardType: any = [
    { name: 'clear', value: 'clear' },
    { name: 'Not Clear', value: 'not_clear' },
  ];
  liveCheckType: any = [
    { name: 'Ok', value: 'Ok' },
    { name: 'Rejected', value: 'Rejected' },
  ];
  addressType: any = [
    { name: 'clear', value: 'clear' },
    { name: 'Not Clear', value: 'not_clear' },
  ];
  scanResultType: any = [
    { name: 'Incomplete', value: 'Incomplete' },
    { name: 'Rejected', value: 'Rejected' },
    { name: 'Verified', value: 'Verified' },
  ];
  isDocumentDetails: boolean;
  isScanHistory: boolean;
  isScanResult: boolean;
  isComments: boolean;
  enableZoom: Boolean = true;
  previewImageSrc: any = '';
  zoomImageSrc: any = '';
  imagePlaceHolder = './../../assets/name.svg';
  idCardPlaceholder = './../../assets/id-card.svg';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private serviceServive: ServicesService,
    private cd: ChangeDetectorRef,
    private toast: TosterService,
    private router: Router,
    private ngxImgZoom: NgxImgZoomService,
    public dialog: MatDialog,
    private report: ReportService,
    private location: Location,
    private ref: ChangeDetectorRef,
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.id = this.route.snapshot.params['id'];
    this.accessType = Cookie.get('Access_Type');
    this.userId = Cookie.get('id');
    this.getUserDetails();
    await this.documentLoad();

    this.checkAccessType();
  }

  overLayImage = (value: string) => {
    const img = value;
    const dialogRef = this.dialog.open(IdDetailsComponent, {
      panelClass: 'custom-dialog-container',
      width: '900px',
      data: { img: img }
    });
    dialogRef.afterClosed().subscribe(() => {

    });
  }
  isString(val): boolean { return val.includes('storage.googleapis.com') }
  clearUrl = () => {
    this.isGenerated = true;
    this.verificaionUrl = '';
  }
  clickGenerate = () => {
    this.isGenerated = false;
    this.verificaionUrl = "loading please wait"
    Cookie.set('docForRegenerateUrl', this.id.toString())
    this.report.reGenerateUrl().subscribe((res) => {
      console.log(res)
      if (res.msg === 'success') {
        this.isGenerated = false;
        this.verificaionUrl = res.url
      }
      this.ref.detectChanges();
    }, (error: any) => {
      console.log(error);
    })
  }
  sendEmail = () => {
    console.log(this.document)
    const data = {
      "fromUser": Cookie.get('id'),
      "tenentId": this.document.Tenant_ID,
      "recipientEmail": this.emailId,
      "type": "Verification url",
      "data": JSON.stringify({ url: this.verificaionUrl, sdk: this.document.sdkKey_ID })
    }
    this.serviceServive.sendEmail(data).subscribe((res) => {
      if (res.data === 'delivered') {
        this.toast.openSnackBar('Successfully message delivered', 'Success')
      } else {
        this.toast.openSnackBar('Message delivered Failed', 'Failed')
      }
      console.log(res)
    }, (err) => {
      console.log(err);
    })
  }
  documentLoad = async () => {
    await this.getAllScanDocumentById(this.id)
      .then((res) => {
        this.dataSource = res;
        console.log(res)
        if (this.dataSource.length === 0) {
          this.router.navigateByUrl('/documents');
        }

        if (res[0]) {
          this.tenent_ID = res[0].Tenant_ID
          this.scanDocument.slice(0, this.scanDocument.length)
          this.scanDocument.push(res[0]);
          this.scanId = res[0]._id;
          this.scanIdDetails = res[0];
          this.getDocumentTypeList(this.tenent_ID);
          this.scanDocumentById(this.scanId);
        }

        this.scanDocument.map((i: any, index: string | number) => {
          const obj = {};
          this.scanDocument[index].dob = new Date(
            moment(i.dob, 'DD-MM-YYYY').format('MM/DD/YYYY')
          );
          this.scanDocument[index].idExpiryDate = new Date(
            moment(i.idExpiryDate, 'DD-MM-YYYY').format('MM/DD/YYYY')
          );
          this.scanDocument[index].updatedDate = new Date(
            moment(i.updatedDate, 'DD-MM-YYYY').format('MM/DD/YYYY')
          );
          this.scanDocument[index].idIssueDate = new Date(
            moment(i.idIssueDate, 'DD-MM-YYYY').format('MM/DD/YYYY')
          );
          this.getAllComment(i._id, i.Document_ID);
          // this.scanDocument[index].push(obj);
        });
        this.ref.detectChanges();
        // console.log(this.scanDocument);
      })
      .catch((error) => console.error(error));
    this.getDocument(this.id);
  }
  getDocumentTypeList = (tenentId: any) => {
    const data = {
      Tenent_ID: tenentId
    }
    this.report.getDocTypeList(data).subscribe((res) => {
      console.log(res)
      if (res.apires === 1 && res.msg === 'success') {
        this.documentIdType = res.data;
      } else {
        this.documentIdType = []
      }
      this.ref.detectChanges();
    }, (error: any) => {
      console.log(error)
    })
  }
  getAllComment = (scanId: string, documentId: any) => {
    const data = {
      scanId,
      documentId
    };
    this.serviceServive.getAllComment(data).subscribe((res) => {
      if (res.msg === 'success') {
        const obj = {};
        obj['id'] = scanId;
        obj['data'] = res.data;
        this.commentsData.push(obj);
      }
      this.ref.detectChanges();
    });
  }
  SelectIdType = (value: any) => {
    // this.form.value.ID_Type = value.value;
    console.log(value.value);
  }
  filterComments = (scanId: string, documentId: any) => {
    const data = {
      scanId,
      documentId
    };
    console.log(data);
    this.serviceServive.getAllComment(data).subscribe((res) => {
      if (res.msg === 'success') {
        this.commentsData.map((i: any, index: any) => {
          if (this.commentsData[index].id === scanId) {
            this.commentsData[index].data = res.data;
          }
        });
      }
      this.ref.detectChanges();
    });
  }
  checkAccessType = () => {
    if (this.accessType === '3' || this.accessType === '4') {
      console.log('2,4');
      this.disabled = true;
    } else if (this.accessType === '1' || this.accessType === '2') {
      console.log('1,3');
      this.disabled = false;
    }
  }
  back = () => {
    this.location.back();
  }
  getDocument = (id: any) => {
    // get item details using id
    this.serviceServive.getDocumentBy(id).subscribe((response) => {
      this.document = response.data;
      this.docId = response.data._id;
      this.ref.detectChanges();
    });
  }
  donwLoad = (data: any) => {
    this.router.navigateByUrl('/print')
    data.Document_ID = this.document.Document_ID;
    this.report.printAbleData(data);
    // window.open('/print');
    // const printContent = document.getElementById("id-card1");
    // //  pdfMake.createPdf(printContent).open();
    // // const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    // const WindowPrt = window.open();
    // // const WindowPrt :any = window.open();
    // WindowPrt.document.write('<link rel="stylesheet" type="text/css" href="./../../assets/css/style.scss">');
    // WindowPrt.document.write('<link rel="stylesheet" type="text/css" href="./document-details.component.scss">');
    // WindowPrt.document.write(printContent.innerHTML);
    // WindowPrt.document.close();
    // WindowPrt.focus();
    // WindowPrt.print();
    // WindowPrt.close();



  }

  getAllScanDocumentById = (id: any) => {
    return new Promise((resolve, reject) => {
      this.serviceServive.geScanDocumentList(id).subscribe(
        (response) => {
          if (response.msg === 'success') {
            resolve(response.data);
          }
        },
        // tslint:disable-next-line:no-shadowed-variable
        (error) => reject(error)
      );
    });
  }
  getUserDetails = () => {
    const id = this.userId;
    this.serviceServive.getUserDetails(id).subscribe((res) => {
      // console.log(res.data.Contact_Name);
      this.userName = res.data?.Contact_Name;
    });
  }
  nextScan(id: any) {
    this.serviceServive.getScanDocumentById(id).subscribe((res) => {
      this.scanDocument.slice(0, this.scanDocument.length)
      if (res.msg === 'success') {
        this.scanDocument = [res.data];
        // res.data.map((i: any, index) => {
        res.data['deviceSignature'] = JSON.parse(res.data.deviceSignature);
        // })
        this.scanIdDetails = res.data;
        this.sideNav.close()
      }
      this.ref.detectChanges();
    }, (err) => {
      console.log(err);
      this.toast.openSnackBar('Something Went Wrong', 'failed')

    })
  }
  shareDoc = ($event: any) => {
    $event.stopPropagation();
    alert('shared');
  }
  SelectType = (type: any, value: any) => {
    console.log(type);
    console.log(value);
    if (type === 'ID_Type') {
      if (value === 'clear') {
        this.isIdStatus = false;
      } else {
        this.isIdStatus = true;
      }
    }
    if (type === 'Address') {
      if (value === 'clear') {
        this.isAddressStatus = false;
      } else {
        this.isAddressStatus = true;
      }
    }
    if (type === 'LiveCheck') {
      if (value === 'Ok') {
        this.isLiveCheck = false;
      } else {
        this.isLiveCheck = true;
      }
    }
  }
  submitScanResult = (form: NgForm) => {
    const data = {
      liveCheckingStatus: form?.value?.LiveCheck,
      scanResultStatus: form?.value?.scanResult,
      selfiePhotoMatchStatus: form?.value?.selefieMatchPercengates,
      scanResultComment: form?.value?.scanResultComment,
      idCardStatus: form?.value?.ID_Type,
      addressStatus: form?.value?.Address,
      idCardComment: form?.value?.idCardTypeComment,
      livecheckStatusComment: form?.value?.liveCheckComments,
      addressStatusComment: form?.value?.addressComments
    };
    console.log(data);
    const id = this.scanId;
    this.serviceServive.scanResults(id, data).subscribe((res) => {
      if (res.status === 'success') {
        this.toast.openSnackBar('Success', res.status)
        // this.scanDocumentById(id);
        this.nextScan(id);
        // this.documentLoad();
        this.sideNav.close();
      }
      // console.log(res)
      // this
      this.ref.detectChanges();
    }, (err) => {
      console.log(err);
      this.toast.openSnackBar('Something Went Wrong', 'failed')
    });
  }
  selectIdFront = (idfront: any) => {
    console.log(idfront.value);
    this.idCardFrontStatus = idfront.value;
  }
  selectIdBack = (idBack: any) => {
    console.log(idBack.value);
    this.idCardBackStatus = idBack.value;
  }
  selectLiveCheck = (liveCheck: any) => {
    console.log(liveCheck.value);
    this.liveCheckingStatus = liveCheck.value;
  }
  selectResultType = (resultType: any) => {
    console.log(resultType.value);
    this.scanResultStatus = resultType.value;
  }

  onSave = (form: NgForm, scanId: any) => {
    const id = scanId;
    const data = {
      ID_Type: form.value.ID_Type,
      idCardNo: form.value.idCardNo,
      firstName: form.value.firstName,
      lastName: form.value.lastName,
      dob: form.value.dob,
      idExpiryDate: form.value.idExpiryDate,
      building_No: form.value.building_No,
      streetName: form.value.streetName,
      city: form.value.city,
      postalCode: form.value.postalCode,
      nationality: form.value.nationality,
      idIssueDate: form.value.idIssueDate,
    }
    this.serviceServive.approvedScanDocument(id, data).subscribe(
      (response) => {
        if (response.msg = 'success') {
          this.sideNav.close();
          this.nextScan(id);
          this.toast.openSnackBar('Success', response.status);
        }
        console.log(response);
        const data = {
          user: Cookie.get('id'),
          tenentId: Cookie.get('Tenant_ID'),
          activity: 'Save Scan',
          details: JSON.stringify({ document_id: this.docId, scan_id: scanId })
        };
        this.audits(data);
        this.ref.detectChanges();
      }, (err) => {
        console.log(err);
        this.toast.openSnackBar('Something Went Wrong', 'failed')

      })
  }
  selectDate = (event: any) => {
    this.dateOfBirth = event;
    console.log(event.target.value);
  }

  scanDocumentById = (id: any) => {
    // const id = '';
    this.serviceServive.getScanDocumentById(id).subscribe((res) => {
      console.log(res)
      if (res.msg === 'success') {
        this.resutData = res.data;
        res.data['deviceSignature'] = JSON.parse(res.data.deviceSignature);
        this.scanIdDetails = res.data;
        console.log(this.scanIdDetails);
        console.log(this.resutData);
      }
      this.ref.detectChanges();
    }, (err) => {
      console.log(err);
      this.toast.openSnackBar('Something Went Wrong', 'failed')

    })
  }
  deleteScan = (id: any) => {
    console.log(id)
    console.log(this.router.url);
    this.serviceServive.deleteScan(id).subscribe((res) => {
      console.log(res)
      if (res.msg === 'success') {
        this.toast.openSnackBar('Successfully deleted Scan', 'Success');
        this.router.navigateByUrl(this.router.url)
        let currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
          console.log(currentUrl);
        });
        // this.ngOnInit();
        // this.documentLoad()
        // console.log(this.dataSource[1].Scan_ID);
        // const scanId = this.dataSource[1].Scan_ID;
        // this.nextScan(scanId);
        this.ref.detectChanges();
      } else {
        this.toast.openSnackBar('Something Went Sr', 'Success');
      }
    }, (err: any) => {
      console.log(err)
    })
  }
  clear = () => { };
  sendComment = (scanId: any) => {

    const doctId = this.id;
    this.comments.map((i: any, index: number) => {
      console.log(i);
      if (this.comments[index] === i) {
        this.comment = i;
        this.comments.splice(index, this.comments.length);
      }
    });
    if (!this.comment) {
      return this.toast.openSnackBar('Please Enter Comment', 'failed');
    }
    const data = {
      documentId: this.id,
      scanId,
      userId: this.userId,
      username: this.userName,
      text: this.comment,
      mode: 'dadasdas'
    };
    this.serviceServive.userComment(data).subscribe((res) => {
      if (res.msg === 'success') {
        this.filterComments(scanId, this.id);
        this.toast.openSnackBar('Comment Posted', 'Success');
      }
      console.log(res);
      this.ref.detectChanges();
    }, (error: any) => {
      console.log(error)
      this.toast.openSnackBar('Comment Post Failed', 'Success');
    });
    // const data1 = {
    //   user: Cookie.get('id'),
    //   tenentId: Cookie.get('Tenant_ID'),
    //   activity: 'Comment Scan',
    //   details: JSON.stringify({document_id: this.docId, scanId})
    // };
    // this.audits(data1);
  }
  // tslint:disable-next-line:member-ordering
  customOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: true,
    dots: false,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
    nav: true,
    navText: ['<span> <i class="material-icons">keyboard_arrow_left</i> <span>Front</span> </span>',
      '<span> <span>Back</span> <i class="material-icons">keyboard_arrow_right</i> </span>']
  };
  // tslint:disable-next-line:member-ordering
  livelinessOptions: OwlOptions = {
    loop: false,
    autoplay: false,
    center: true,
    dots: true,
    autoHeight: true,
    autoWidth: true,
    responsive: {
      0: {
        items: 1,
      },
      600: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
    // nav: true
  };
  audits = (data: any) => {
    this.serviceServive.audit(data).subscribe((res) => {
      console.log(res);
      // tslint:disable-next-line:no-shadowed-variable
    }, (error: any) => {
      console.log(error);
    });
  }
  open(a) {
    if (a == 'document-details') {
      this.isDocumentDetails = true;
      this.isScanHistory = false;
      this.isScanResult = false;
      this.isComments = false;
    } else if (a == 'scan-history') {
      this.isDocumentDetails = false;
      this.isScanHistory = true;
      this.isScanResult = false;
      this.isComments = false;

    }
    else if (a == 'scan-result') {
      this.isDocumentDetails = false;
      this.isScanHistory = false;
      this.isScanResult = true;
      this.isComments = false;

    }
    else if (a = 'comments') {
      this.isDocumentDetails = false;
      this.isScanHistory = false;
      this.isScanResult = false;
      this.isComments = true;

    }
    else {
      this.isDocumentDetails = false;
      this.isScanHistory = false;
      this.isScanResult = false;
      this.isComments = false;

    }
  }
}
