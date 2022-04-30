import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from '../../router.animations';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { NgxSpinnerService } from "ngx-spinner";
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-tables',
    templateUrl: './studentList.component.html',
    styleUrls: ['./studentList.component.scss'],
    animations: [routerTransition()],
})

export class StudentListComponent implements OnInit {
    @ViewChild(DataTableDirective, {static: false})
    dtElement: DataTableDirective;
    isDtInitialized:boolean = false;
    title = 'angulardatatables';
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();

    public listData : any;
    public editID : any;
    public modalReference : any;
    public formType : string;
    closeResult : string;
    detailForm : FormGroup;
    submitted = false;
    cList = [];

    constructor(
        private modalService: NgbModal,
        public router: Router,
        private formBuilder: FormBuilder,
        private toastr: ToastrService,
        private http: HttpClient,
        private SpinnerService: NgxSpinnerService
    ) { }

    ngOnInit() {
        var loggedRole = sessionStorage.getItem("role");
        if(loggedRole == 'student'){
            this.router.navigate(['/login']);
        }

        this.detailForm = this.formBuilder.group({
            name: ['', Validators.required],
            email: ['', [Validators.required,Validators.email]],
            username: ['', Validators.required],
            password: ['', Validators.required],
            address: ['', Validators.required],
            gender: ['', Validators.required],
            dob: ['', Validators.required],
            standard: ['', Validators.required],
            phone: ['', Validators.required],
            course: ['', Validators.required],
            amount: ['', Validators.required],
        });

        this.dtOptions = {
            pagingType: 'full_numbers',
            pageLength: 10,
            processing: true
        };

        this.listGetData();
        this.getCourseList();
    }

    getCourseList() {
        this.http.get(environment.apiBaseUrl+'course/list.php').subscribe(
            res => {
                if(res['status'] == 1){
                    this.cList = res['data'];
                }else{
                    this.toastr.error('Something went wrong');
                }
            },
            error => {
                this.toastr.error(error.error['message']);
            },
        );
    }

    onCourseSelect(val){
        var ths = this;
        for(var i=0; i < this.cList.length; i++){
            var data = this.cList[i]
            if(val == data.course_id){
                ths.detailForm.controls['amount'].setValue(data.fee);
                break;
            }
        }
    }

    listGetData(){
        this.SpinnerService.show();
        this.http.get(environment.apiBaseUrl+'student/list.php').subscribe(
            res => {
                this.SpinnerService.hide();
                this.listData = res['data'];
                if (this.isDtInitialized) {
                    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
                        dtInstance.destroy();
                        this.dtTrigger.next();
                    });
                } else {
                    this.isDtInitialized = true;
                    this.dtTrigger.next();
                }
            },
            error => {
                this.toastr.error(error.error['message']);
                this.router.navigate(['/login']);
            },
        );
    }


    editData(id:any){
        this.SpinnerService.show();
        this.editID = id;

        var apiUrl = environment.apiBaseUrl+'student/studentbyid.php';
        const formData = new FormData();
        formData.append('student_id', id);

        this.http.post(apiUrl, formData).subscribe(
            res => {
                this.SpinnerService.hide();
                if(res['status'] == 1){
                    this.detailForm.controls['name'].setValue(res['data'][0].name);
                    this.detailForm.controls['email'].setValue(res['data'][0].email);
                    this.detailForm.controls['username'].setValue(res['data'][0].username);
                    this.detailForm.controls['password'].setValue(res['data'][0].password);
                    this.detailForm.controls['address'].setValue(res['data'][0].address);
                    this.detailForm.controls['gender'].setValue(res['data'][0].gender);
                    this.detailForm.controls['dob'].setValue(res['data'][0].dob);
                    this.detailForm.controls['standard'].setValue(res['data'][0].standard);
                    this.detailForm.controls['phone'].setValue(res['data'][0].phone);
                    this.detailForm.controls['course'].setValue(res['data'][0].course);
                    this.detailForm.controls['amount'].setValue(res['data'][0].amount);
                }else{
                    this.toastr.error(res['message']);
                }
            },
            error => {
                this.SpinnerService.hide();
                this.toastr.error(error.error['message']);
            },
        );
    }


    saveDetail(){
        this.submitted = true;
        if (this.detailForm.invalid) {
            return;
        }
        this.SpinnerService.show();
        var apiUrl='';

        const formData = new FormData();
        formData.append('name', this.detailForm.value.name);
        formData.append('email', this.detailForm.value.email);
        formData.append('username', this.detailForm.value.username);
        formData.append('password', this.detailForm.value.password);
        formData.append('address', this.detailForm.value.address);
        formData.append('gender', this.detailForm.value.gender);
        formData.append('dob', this.detailForm.value.dob);
        formData.append('standard', this.detailForm.value.standard);
        formData.append('phone', this.detailForm.value.phone);
        formData.append('course', this.detailForm.value.course);
        formData.append('amount', this.detailForm.value.amount);

        if(this.formType == 'add'){
            apiUrl = environment.apiBaseUrl+'student/add.php';
        }else{
            formData.append('student_id', this.editID);
            apiUrl = environment.apiBaseUrl+'student/edit.php';
        }

        this.http.post(apiUrl, formData).subscribe(
            res => {
                this.SpinnerService.hide();
                if(res['status'] == 1){
                    this.modalReference.close();
                    this.listGetData();
                    this.toastr.success(res['message']);
                }else{
                    this.toastr.error(res['message']);
                }
            },
            error => {
                this.SpinnerService.hide();
                this.toastr.error(error.error['message']);
            },
        );
    }



    deleteData(id:any){
        Swal.fire({
            title: 'Are you sure?',
            text: "You wan't to delete ?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, keep it'
        }).then((result) => {
            if (result.value) {
                const formData = new FormData();
                formData.append('student_id', id);
                var apiUrl = environment.apiBaseUrl+'student/delete.php';
                this.http.post(apiUrl, formData).subscribe(
                    res => {
                        if(res['status'] == 1){
                            this.listGetData();
                            this.toastr.success(res['message']);
                        }else{
                            this.toastr.error(res['message']);
                        }
                    },
                    error => {
                        this.toastr.error(error.error['message']);
                    },
                );
            } else if (result.dismiss === Swal.DismissReason.cancel) {

            }
        })
    }


    open(content:any, type:any, id:any) {
        this.submitted = false;
        this.detailForm.markAsPristine();
        this.detailForm.markAsUntouched();
        this.detailForm.updateValueAndValidity();
        this.detailForm.reset();
        this.detailForm.clearValidators();
        Object.keys(this.detailForm.controls).forEach(key => {
            this.detailForm.get(key).setErrors(null) ;
        });

        if(type == 'edit'){
            this.detailForm.controls['email'].disable();
            this.detailForm.controls['username'].disable();
            this.editData(id);
            this.formType = 'edit';
        }else{
            this.formType = 'add';
        }

        this.modalReference = this.modalService.open(content);
        this.modalReference.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });
    }


    getDismissReason(reason: any): string {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
    }


    get fval() {
        return this.detailForm.controls;
    }


}
