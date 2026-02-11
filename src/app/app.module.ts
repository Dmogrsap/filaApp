import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './Navigation/header/header.component';
import { MainMenuComponent } from './Navigation/main-menu/main-menu.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { DxDrawerModule, DxToolbarModule, DxListModule, DxAccordionModule, DxHtmlEditorModule, DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxNumberBoxModule, DxTextAreaModule, DxCheckBoxModule, DxSwitchModule, DxAutocompleteModule, DxTagBoxModule, DxSpeedDialActionModule, DxButtonModule, DxLookupModule, DxFilterBuilderModule, DxDropDownBoxModule, DxTabPanelModule, DxTreeViewModule, DxPopupModule, DxTemplateModule, DxScrollViewModule, DxTooltipModule, DxVectorMapModule, DxChartModule, DxLoadIndicatorModule, DxValidatorModule, DxDateBoxModule, DxDateRangeBoxModule, DxTreeListModule, DxSortableModule, DxFileManagerModule, DxLoadPanelModule, DxFileUploaderModule, DxFormComponent, DxFormModule } from 'devextreme-angular';
import { DxoSearchEditorOptionsModule, DxoSearchPanelModule, DxoZoomAndPanModule, DxoZoomLevelModule, DxoDetailsModule } from 'devextreme-angular/ui/nested';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HomeComponent } from './Navigation/home/home.component';
import { UsersComponent } from './users/users.component';
import { RolesComponent } from './roles/roles.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { LideresComponent } from './lideres/lideres.component';
import { AccessComponent } from './access/access.component';
import { ServidoresAlabanzaComponent } from './servidores-alabanza/servidores-alabanza.component';
import { SongManagerComponent } from './song-manager/song-manager.component';
import { EditHomeComponent } from './edit-home/edit-home.component';
import { ServidorMaestrosComponent } from './servidor-maestros/servidor-maestros.component';
import { LoginPopupComponent } from './login-popup/login-popup.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainMenuComponent,
    HomeComponent,
    UsersComponent,
    RolesComponent,
    LideresComponent,
    AccessComponent,
    ServidoresAlabanzaComponent,
    SongManagerComponent,
    EditHomeComponent,
    ServidorMaestrosComponent,
    LoginPopupComponent,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    AppRoutingModule,
    BrowserAnimationsModule,

    HttpClientModule,
    DxDrawerModule,
    DxToolbarModule,
    DxListModule,
    DxAccordionModule,
    DxHtmlEditorModule,
    DxDataGridModule,
    DxSelectBoxModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxNumberBoxModule,
    DxTextBoxModule,
    DxTextAreaModule,
    DxCheckBoxModule,
    DxSwitchModule,
    DxAutocompleteModule,
    DxTagBoxModule,
    DxSpeedDialActionModule,
    DxButtonModule,
    DxLookupModule,
    DxFilterBuilderModule,
    DxDropDownBoxModule,
    DxTabPanelModule,
    DxTreeViewModule,
    DxoSearchEditorOptionsModule,
    DxoSearchPanelModule,
    BrowserAnimationsModule,
    BrowserTransferStateModule,
    DxSelectBoxModule,
    DxCheckBoxModule,
    DxPopupModule,
    DxTemplateModule,
    DxScrollViewModule,
    DxTooltipModule,
    DxSelectBoxModule,
    DxoZoomAndPanModule,
    DxoZoomLevelModule,
    DxVectorMapModule,
    DxChartModule,
    DxLoadIndicatorModule,
    DxTooltipModule,
    DxValidatorModule,
    DxDateBoxModule,
    DxDateRangeBoxModule,
    DxoDetailsModule,
    DxTreeListModule,
    DxTreeViewModule,
    DxSortableModule,
    DxFileManagerModule,
    DxLoadPanelModule,
    DxFileUploaderModule,
    DxFormModule,


    /*Angular Material*/
    MatSidenavModule,
    MatIconModule,
    DxListModule,
    DxToolbarModule,
    MatIconModule,
    MatSnackBarModule,
    HttpClientModule,
    MatOptionModule,
    MatProgressBarModule,
    ReactiveFormsModule,
    MatOptionModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
