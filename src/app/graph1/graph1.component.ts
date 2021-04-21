import { Component, OnInit } from '@angular/core';
import { PreprocessingService } from '../services/preprocessing.service';

@Component({
    selector: 'app-graph1',
    templateUrl: './graph1.component.html',
    styleUrls: ['./graph1.component.scss']
})
export class Graph1Component implements OnInit {

    constructor(
        private preprocessingService: PreprocessingService
    ) { }

    ngOnInit(): void {
        this.preprocessingService.nameFunction(2019, 100);
    }

}
