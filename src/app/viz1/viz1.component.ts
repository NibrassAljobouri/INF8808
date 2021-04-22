import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { PreprocessingService } from '../services/preprocessing.service';
import * as Plotly from 'plotly.js-dist';
import * as d3 from 'd3';
import {d3legend}  from 'd3-legend';
import { NumberArray, scaleLinear, select } from 'd3';


@Component({
    selector: 'app-viz1',
    templateUrl: './viz1.component.html',
    styleUrls: ['./viz1.component.scss']
})

export class Viz1Component {

    vizForm: FormGroup;
    y:any;

    constructor(
        private formBuilder: FormBuilder,
        private preprocessingService: PreprocessingService,
    ) {
        this.vizForm = this.formBuilder.group({
            income: new FormControl("", [Validators.required, Validators.min(0)]),
            year: new FormControl("", [Validators.required, Validators.min(1917), Validators.max(2020)]),
            typeMoney: new FormControl("", [Validators.required]),
            mode: new FormControl("", [Validators.required]),
        });
        this.vizForm.valueChanges.subscribe(data => this.OnChange());
        this.defaultValue();
    }



    private defaultValue(): void {
        this.vizForm.get("income")?.setValue(10000);
        this.vizForm.get("year")?.setValue(2020);
        this.vizForm.get("typeMoney")?.setValue("current");
        this.vizForm.get("mode")?.setValue("rate");
    }



    isRate(): boolean {
        return this.vizForm.get('mode')?.value === "rate";
    }

    isCurrent(): boolean {
        return this.vizForm.get("typeMoney")?.value === "current";
    }

    OnChange(): void {
        console.log("some change")

         // set the dimensions and margins of the graph
         var margin =  { top: 35, right: 50, bottom: 35, left: 50 },
         width = 1000 - margin.left - margin.right,
         height = 300 - margin.top - margin.bottom;

        var isRate= this.isRate()
        this.preprocessingService.Request(this.getYear(), this.getIncome(), this.isCurrent(), this.isRate()).then((data: any) => {
            var svg=d3.select(".gGraph")
            d3.selectAll(".scaleY").remove()
            d3.selectAll(".scaleX").remove()

            //scale x
            var yearStartFederal = 1929;
            var yearEnd = 2021;

            var xCombine = d3.range(yearStartFederal, yearEnd, 1);

            var x = d3.scaleLinear()
                .domain([1929,  2020])
                .range([ 0, width ]);
                svg.append("g")
                .attr('class', 'scaleX')
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(d3.format("d")));


            var value: Array<NumberArray> =  data[2]
            var y = d3.scaleLinear()
                .domain([0, d3.max(value, function (d) { return d[0]; }) as number  ] )
                .range([ height, 0 ]);
                svg.append("g")
                    .attr('class', 'scaleY')
                    .call(d3.axisLeft(y));

            svg.selectAll(".trace").remove()

             // Add the line
             svg.append("g")
                .attr("class", "trace")
                .attr("id", "trace0")
                .append("path")
                .datum(data[0])
                .attr("class", "trace")
                .attr("fill", "none")
                .attr("stroke", "red")
                .attr("stroke-width", 1.5)
                .attr("data-legend","Féderal")
                .attr("d", d3.line()
                .x(function(d) { return x(d[1]) })
                .y(function(d) { return y(d[0]) })
                )
            svg.append("g")
                .attr("class", "trace")
                .attr("id", "trace1")
                .append("path")
                .datum(data[1])
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("data-legend","Provincial")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d[1]) })
                .y(function(d) { return y(d[0]) })
                )

            svg.append("g")
                .attr("class", "trace")
                .attr("id", "trace2")
                .append("path")
                .datum(data[2])
                .attr("fill", "none")
                .attr("stroke", "green")
                .attr("data-legend","Combiné")
                .attr("stroke-width", 1.5)
                .attr("d", d3.line()
                .x(function(d) { return x(d[1]) })
                .y(function(d) { return y(d[0]) })
                )


                d3.selectAll(".mouse-over-effects").remove()
                d3.selectAll(".tooltip").remove()

                var keys = ["Federal", "Provincial", "Combine"]
                var color = d3.scaleOrdinal()
                .domain(keys)
                .range(["red","steelblue","green"]);


                var tooltip = d3.select(".container").append("div")
                .attr('id', 'tooltip')
                .attr("class", "tooltip")
                .style('position', 'absolute')
                .style("background-color", "#D3D3D3")
                .style('padding', 10)
                .style('display', 'none')

                var newData= [{key:"Federal", data:data[0]}, {key:"Provincial", data:data[1]}, {key:"Combine", data:data[2] }];
                var mouseG = svg.append("g")
                    .attr("class", "mouse-over-effects");

                mouseG.append("path") // create vertical line to follow mouse
                    .attr("class", "mouse-line")
                    .style("stroke", "#A9A9A9")
                    .style("stroke-width", "2px")
                    .style("opacity", "0");

                var lines = document.getElementsByClassName('line');

                var mousePerLine = mouseG.selectAll('.mouse-per-line')
                    .data(newData)
                    .enter()
                    .append("g")
                    .attr("class", "mouse-per-line");

                mousePerLine
                    .append("circle")
                    .attr("r", 4)
                    .style("stroke", function (d) {
                    return color(d.key) as any
                    })
                    .style("fill", "none")
                    .style("stroke-width", "2px")
                    .style("opacity", "0");

                mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .on('mouseout', function () { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "0");
                    d3.selectAll("#tooltip")
                        .style('display', 'none')

                    })
                    .on('mouseover', function (event) { // on mouse in show line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "1");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "1");
                    d3.selectAll("#tooltip")
                        .style("left", (event.pageX+20) + "px")
                        .style("top", (event.pageY - 20) + "px")
                        .style('display', 'block');
                    })
                    .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                        var mouse = d3.pointer(event, svg.node());
                        d3.selectAll("#tooltip")
                            .style("left", (event.pageX+20) + "px")
                            .style("top", (event.pageY - 20) + "px")
                        d3.selectAll(".mouse-per-line")
                            .attr("transform", function (d: any, i) {
                            var xDate = x.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                            var bisect = d3.bisector(function (d) { return d; }).left // retrieve row index of date on parsed csv
                            var idx = bisect(xCombine, xDate) ;

                            d3.select(".mouse-line")
                                .attr("d", function () {
                                    var data = "M" + x(d.data[idx][1]) + "," + (height);
                                    data += " " + x(d.data[idx][1]) + "," + 0;
                                    return data;
                                });
                            return "translate(" + x(d.data[idx][1]) + "," + y(d.data[idx][0]) + ")";

                        });

                    var sortingObj:any = []
                    newData.map(d => {
                        var xDate = x.invert(mouse[0])
                        var bisect = d3.bisector(function (d) { return d; }).left // retrieve row index of date on parsed csv
                        var idx = bisect(xCombine, xDate) ;
                        sortingObj.push( {key: d.key ,date: d.data[idx][1], value: d.data[idx][0]} )
                    })

                    sortingObj.sort(function(x, y){
                        return d3.descending(x.value, y.value);
                    })

                    var sortingArr = sortingObj.map(d=> d.key)


                    var res_nested1 = newData.slice().sort(function(a, b){
                        return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key)
                    })

                    var typeOfValue=" $"
                    if(isRate){
                        typeOfValue=" %"
                    }

                    tooltip.html("Date:" + sortingObj[0].date)
                    .style('display', 'block')
                    // .style('left', x(sortingObj[2].date) + 100 + "px" )
                    // .style('top', y(sortingObj[2].value) +200 + "px")
                    .style('font-size', 11.5)
                    .selectAll()
                    .data(res_nested1).enter()
                    .append('div')
                    .style('color', d => {
                        return color(d.key) as any
                    })
                    .style('font-size', 10)
                    .html(d => {
                        var xDate = x.invert(mouse[0])
                        var bisect = d3.bisector(function (d) { return d; }).left
                        var idx = bisect(xCombine, xDate) ;
                        return d.key.substring(0, 3)+": " + d.data[idx][0].toString()+typeOfValue
                    }

                    )
                })





        });

    }

    getIncome(): number {
        if (this.vizForm.get("income")?.value < 0){
            console.log("00")
            return 0;
        }
        return this.vizForm.get("income")?.value;
    }

    getYear(): number {
        if (this.vizForm.get("year")?.value < 0){
            return 0;
        }
        return this.vizForm.get("year")?.value;
    }




    displayRates(): void {

        d3.selectAll(".scaleY").remove()
        d3.selectAll(".scaleX").remove()
        d3.selectAll(".trace").remove()

        var layout = {
            title: "Évolution du taux d'imposition selon les années pour un revenu de " + this.getIncome(),
            xaxis: {
              title: 'Année',
              showgrid: false,
              zeroline: false
            },
            yaxis: {
              title: 'Taux d\'imposition (%)',
              showline: false
            },
            legend: {traceorder: 'reversed'}
          };

        // set the dimensions and margins of the graph
        var margin =  { top: 35, right: 50, bottom: 35, left: 50 },
        width = 1000 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select(".viz1")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr('class', 'gGraph')
            .attr("transform",
                "translate(" + margin.left+ "," + margin.top + ")");
        var isRate= this.isRate()
        this.preprocessingService.Request(this.getYear(), this.getIncome(), this.isCurrent(), this.isRate()).then((data: any) => {

                //scale x
                var yearStartFederal = 1929;
                var yearEnd = 2021;

                var xCombine = d3.range(yearStartFederal, yearEnd, 1);
                var newData= [{key:"Federal", data:data[0]}, {key:"Provincial", data:data[1]}, {key:"Combine", data:data[2] }];

                var x = d3.scaleLinear()
                    .domain([1929,  2020])
                    .range([ 0, width ]);
                    svg.append("g")
                    .attr('class', 'scaleX')
                    .attr("width", width)
                    .attr("height", height)
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3.axisBottom(x).tickFormat(d3.format("d")));


                // Add Y axis
                var value: Array<NumberArray> =  data[2]
                var y = d3.scaleLinear()
                    .domain([0, d3.max(value, function (d) { return d[0]; }) as number  ] )
                    .range([ height, 0 ]);
                    svg.append("g")
                        .attr('class', 'scaleY')
                        .call(d3.axisLeft(y));


                // Add the line
                svg.append("g")
                    .attr("class", "trace")
                    .attr("id", "trace0")
                    .append("path")
                    .datum(data[0])
                    .attr("class", "trace")
                    .attr("fill", "none")
                    .attr("stroke", "red")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                    .x(function(d) { return x(d[1]) })
                    .y(function(d) { return y(d[0]) })
                    );
                svg.append("g")
                    .attr("class", "trace")
                    .attr("id", "trace1")
                    .append("path")
                    .datum(data[1])
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                    .x(function(d) { return x(d[1]) })
                    .y(function(d) { return y(d[0]) })
                    );

                svg.append("g")
                    .attr("class", "trace")
                    .attr("id", "trace2")
                    .append("path")
                    .datum(data[2])
                    .attr("fill", "none")
                    .attr("stroke", "green")
                    .attr("stroke-width", 1.5)
                    .attr("d", d3.line()
                    .x(function(d) { return x(d[1]) })
                    .y(function(d) { return y(d[0]) })
                    );


                // LEGENDE
                var keys = ["Fédéral", "Provincial", "Combine"]
                var color = d3.scaleOrdinal()
                .domain(keys)
                .range(["red","steelblue","green"]);

                svg.selectAll("mydots")
                .data(keys)
                .enter()
                .append("circle")
                    .attr("cx", width-100)
                    .attr("cy", function(d,i){ return 0 + i*25})
                    .attr("r", 7)
                    .style("fill", function(d){ return color(d)} as any );

                svg.selectAll("mylabels")
                .data(keys)
                .enter()
                .append("text")
                    .attr("x", width+20-100)
                    .attr("y", function(d,i){ return 0 + i*25})
                    .style("fill", function(d){ return color(d)} as any)
                    .text(function(d){ return d})
                    .attr("text-anchor", "left")
                    .style("alignment-baseline", "middle");

                // CREATE HOVER TOOLTIP WITH VERTICAL LINE //
                var tooltip = d3.select(".container").append("div")
                    .attr('id', 'tooltip')
                    .attr("class", "tooltip")
                    .style('position', 'absolute')
                    .style("background-color", "#D3D3D3")
                    .style('padding', 10)
                    .style('display', 'none')

                var mouseG = svg.append("g")
                    .attr("class", "mouse-over-effects");

                mouseG.append("path") // create vertical line to follow mouse
                    .attr("class", "mouse-line")
                    .style("stroke", "#A9A9A9")
                    .style("stroke-width", "2px")
                    .style("opacity", "0");

                var lines = document.getElementsByClassName('line');

                var mousePerLine = mouseG.selectAll('.mouse-per-line')
                    .data(newData)
                    .enter()
                    .append("g")
                    .attr("class", "mouse-per-line");

                mousePerLine
                    .append("circle")
                    .attr("r", 4)
                    .style("stroke", function (d) {
                    return color(d.key) as any
                    })
                    .style("fill", "none")
                    .style("stroke-width", "2px")
                    .style("opacity", "0");

                mouseG.append('svg:rect') // append a rect to catch mouse movements on canvas
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill', 'none')
                    .attr('pointer-events', 'all')
                    .on('mouseout', function () { // on mouse out hide line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "0");
                    d3.selectAll(".mouse-per-line text")
                        .style("opacity", "0");
                    d3.selectAll("#tooltip")
                        .style('display', 'none')

                    })
                    .on('mouseover', function (event) { // on mouse in show line, circles and text
                    d3.select(".mouse-line")
                        .style("opacity", "1");
                    d3.selectAll(".mouse-per-line circle")
                        .style("opacity", "1");
                    d3.selectAll("#tooltip")
                        .style("left", (event.pageX +20)+ "px")
                        .style("top", (event.pageY - 20) + "px")
                        .style('display', 'block');
                    })
                    .on('mousemove', function (event) { // update tooltip content, line, circles and text when mouse moves
                        var mouse = d3.pointer(event, svg.node());
                        d3.selectAll("#tooltip")
                            .style("left", (event.pageX+20) + "px")
                            .style("top", (event.pageY - 20) + "px");
                        d3.selectAll(".mouse-per-line")
                            .attr("transform", function (d: any, i) {
                            var xDate = x.invert(mouse[0]) // use 'invert' to get date corresponding to distance from mouse position relative to svg
                            var bisect = d3.bisector(function (d) { return d; }).left // retrieve row index of date on parsed csv
                            var idx = bisect(xCombine, xDate) ;

                            d3.select(".mouse-line")
                                .attr("d", function () {
                                    var data = "M" + x(d.data[idx][1]) + "," + (height);
                                    data += " " + x(d.data[idx][1]) + "," + 0;
                                    return data;
                                });
                            return "translate(" + x(d.data[idx][1]) + "," + y(d.data[idx][0]) + ")";

                        });

                    var sortingObj:any = []
                    newData.map(d => {
                        var xDate = x.invert(mouse[0])
                        var bisect = d3.bisector(function (d) { return d; }).left // retrieve row index of date on parsed csv
                        var idx = bisect(xCombine, xDate) ;
                        sortingObj.push( {key: d.key ,date: d.data[idx][1], value: d.data[idx][0]} )
                    })

                    sortingObj.sort(function(x, y){
                        return d3.descending(x.value, y.value);
                    })

                    var sortingArr = sortingObj.map(d=> d.key)


                    var res_nested1 = newData.slice().sort(function(a, b){
                        return sortingArr.indexOf(a.key) - sortingArr.indexOf(b.key)
                    })

                    var typeOfValue=" $"
                    if(isRate){
                        typeOfValue=" %"
                    }

                    tooltip.html("Date:" + sortingObj[0].date)
                    .style('display', 'block')
                    // .style('left', x(sortingObj[0].date) + 100 + "px" )
                    // .style('top', y(sortingObj[0].value) +200 + "px")
                    .style('font-size', 11.5)
                    .selectAll()
                    .data(res_nested1).enter()
                    .append('div')
                    .style('color', d => {
                        return color(d.key) as any
                    })
                    .style('font-size', 10)
                    .html(d => {
                        var xDate = x.invert(mouse[0])
                        var bisect = d3.bisector(function (d) { return d; }).left
                        var idx = bisect(xCombine, xDate) ;
                        return d.key.substring(0, 3)+": " + d.data[idx][0].toString()+typeOfValue
                    }

                    )
                })
            })
        }



    ngOnInit(): void {

        this.displayRates();

    }

}
