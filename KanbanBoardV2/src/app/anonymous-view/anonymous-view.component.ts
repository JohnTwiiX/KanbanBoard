import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-anonymous-view',
    imports: [RouterLink],
    templateUrl: './anonymous-view.component.html',
    styleUrls: ['./anonymous-view.component.scss', '../is-verified/is-verified.component.scss']
})
export class AnonymousViewComponent {

}
