import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GradeListComponent } from './gradeList.component';

const routes: Routes = [
    {
        path: '',
        component: GradeListComponent
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class GradeListRoutingModule {

}
