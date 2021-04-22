import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
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
        
        
        //this.preprocessingService.Request(2020, 1000000,  true, true).then((data:any) =>console.log(data));
    
    }

}
