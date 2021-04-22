import { Component, OnInit } from '@angular/core';
import { PreprocessingService } from '../services/preprocessing.service';
import * as Plotly from 'plotly.js-dist';
import * as d3 from 'd3';
import { Numeric } from 'd3';

@Component({
  selector: 'app-viz2',
  templateUrl: './viz2.component.html',
  styleUrls: ['./viz2.component.scss']
})
export class Viz2Component implements OnInit {

  constructor(
    private preprocessingService: PreprocessingService,
  ) { }

  ngOnInit(): void {
    this.display_baremes_d3();
  }

  display_baremes_d3(): void {

    // this.preprocessingService.extractSalaryRange().then((data: any) => {

    d3.json('./assets/dataJson.txt').then((data: any) => {

      var data_fig2 = data.data;

      // set the dimensions and margins of the graph
      var margin =  { top: 35, right: 50, bottom: 35, left: 50 },
      width = 1000 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

      // append the svg object to the body of the page

      var svg = d3.select("#fig2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

      // Add X axis
      var x = d3.scaleLinear()
      .domain(d3.extent(data_fig2, function(d: any) { return parseInt(d.year); }) as any)
      .range([ 0, width ]);

      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([d3.min(data_fig2, function(d: any) {
          var values_selected = [parseInt(d["Quebec Revenu imposable plus de "]), parseInt(d["Fédéral Revenu imposable plus de "]), parseInt(d["Combiné Revenu imposable plus de "])];
          return d3.min(values_selected); }) as any,
          d3.max(data_fig2, function(d: any) {
            var values_selected = [parseInt(d["Quebec Revenu imposable plus de "]), parseInt(d["Fédéral Revenu imposable plus de "]), parseInt(d["Combiné Revenu imposable plus de "])];
            return d3.max(values_selected); }) as any])
        .range([ height, 0]);

      svg.append("g")
        .call(d3.axisLeft(y));

      // create a tooltip
      var Tooltip = d3.select("#fig2")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "black")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = (d) => {
        Tooltip
          .style("opacity", 12)
        d3.select(this as any)
          .style("stroke", "white")
          .style("opacity", 1)
          .html("The exact value of<br>this cell is: " + x(parseInt(d.year)))
          .style("left", (d3.pointer(event, svg.node())[0]+70) + "px")
          .style("top", (d3.pointer(event, svg.node())[1]) + "px")
      }
      var mousemove = (d) => {
        Tooltip
          .html("The exact value of<br>this cell is: " + x(parseInt(d.year)))
          .style("left", (d3.pointer(event, svg.node())[0]+70) + "px")
          .style("top", (d3.pointer(event, svg.node())[1]) + "px")
      }

      var mouseleave = (d) => {
        Tooltip
          .style("opacity", 0)
        d3.select(this as any)
          .style("stroke", "none")
          .style("opacity", 0.8)
      }



      // Add dots
      svg.append('g')
        .selectAll("dot")
        .data(data_fig2)
        .enter()
        .append("text")
          .attr("x", function (d: any) { return x(parseInt(d.year)); } )
          .attr("y", function (d: any) { return y(parseInt(d["Fédéral Revenu imposable plus de "])); })
          .attr('stroke', 'red')
          .style("font-size", function (d: any) { return d["Fédéral Revenu imposable plus de "] ? 19 : 0; })
          .text("-")
          .on("mouseover", mouseover)
          .on("mousemove", mousemove)
          .on("mouseleave", mouseleave)

      svg.append('g')
      .selectAll("dot")
      .data(data_fig2)
      .enter()
      .append("text")
        .attr("x", function (d: any) { return x(parseInt(d.year)); } )
        .attr("y", function (d: any) { return y(parseInt(d["Quebec Revenu imposable plus de "])); })
        .attr('stroke', 'steelblue')
        .style("font-size", function (d: any) { return d["Quebec Revenu imposable plus de "] ? 19 : 0; })
        .text("-")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

      /*
      svg.append('g')
      .selectAll("dot")
      .data(data_fig2)
      .enter()
      .append('text')
      .attr('x', function (d: any) { return x(parseInt(d.year)); } )
      .attr('y', function (d: any) { return y(parseInt(d["Combiné Revenu imposable plus de "])); })
      .attr('stroke', 'yellow')
      .style("font-size", function (d: any) { return d["Combiné Revenu imposable plus de "] ? 19 : 0; })
      .text("-")
      */

      var keys = ["Fédéral", "Provincial"]

      var color = d3.scaleOrdinal()
      .domain(keys)
      .range(["red","steelblue"]);

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
          .text(function(d){ return d})
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle");


    })

  }

}
