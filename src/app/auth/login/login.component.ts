import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../../app.reducer';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';
import * as ui from 'src/app/shared/ui.actions';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  cargando = false;
  uiSubscription: Subscription;

  constructor( private fb: FormBuilder,
               private authservice: AuthService,
               private store: Store<AppState>,
               private router: Router) { }

  ngOnInit(): void {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.uiSubscription = this.store.select('ui').subscribe( ui => {
                           this.cargando = ui.isLoading;
                          });

  }

  ngOnDestroy() {
    this.uiSubscription.unsubscribe();
  }

  login() {

    if (this.loginForm.invalid) { return; }

    this.store.dispatch( ui.isLoading());
/*
    Swal.fire({
      title: 'Espere por favor',
      willOpen: () => {
        Swal.showLoading();
      }
    }); */

    const { email, password } = this.loginForm.value;
    this.authservice.loginUsuario(email, password)
      .then(credenciales => {
        console.log(credenciales);
       // Swal.close();
        this.store.dispatch(ui.stopLoading());
        this.router.navigate(['/']);

      })
      .catch( err => {
        this.store.dispatch(ui.stopLoading());
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text:  err.message
        });
      });

  }

}
