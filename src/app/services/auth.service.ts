import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.models';
import { Subscription } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userSubscription: Subscription;

  constructor( public auth: AngularFireAuth,
               public firestore: AngularFirestore,
               private store: Store<AppState> ) { }

  initAuthListener() {

    this.auth.authState.subscribe( fuser => {
      // console.log(fuser?.uid);
      if(fuser) {

       this.userSubscription = this.firestore.doc(`${ fuser.uid}/usuario`).valueChanges()
          .subscribe ( (firestoreUser: any) =>{

            console.log("USUARIO: ", {firestoreUser});

            const user = Usuario.fromFirebase(firestoreUser);

            this.store.dispatch( authActions.setUser({ user: user }) );
          });

      } else {
        this.userSubscription.unsubscribe();
        this.store.dispatch( authActions.unSetUser() );
      }

    });

  }

  crearUsuario( nombre: string, email: string, password: string) {

    return this.auth.createUserWithEmailAndPassword(email, password)
      .then( ({ user }) => {

        const newUser = new Usuario( user.uid, nombre, user.email );
        return this.firestore.doc(`${ user.uid }/usuario`).set( {...newUser} );

      });

  }

  loginUsuario(email: string, password: string) {

    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(
      map( fbUser => fbUser != null )
    );
  }


}
