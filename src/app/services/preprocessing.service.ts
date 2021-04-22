import { Injectable } from '@angular/core';
import * as d3 from 'd3';


@Injectable({
    providedIn: 'root'
})
export class PreprocessingService {

    public variableJson: any;
    public newJason: any;
    public currentYear: any;

    constructor() { }



    public Request(year: number, income: number, courant: boolean, taux: boolean): any {
        //console.log("init");
        return d3.json('./assets/dataJson.txt').then((data: any) => {
            this.variableJson=data;
            //console.log(this.variableJson);

            let federal:any;
            let provincial:any;
            let combine:any;
            let inflations:any;
            let inflation:any;
            federal=[];
            provincial=[];
            combine=[];

            inflations=[9.2,	9.1,	8.2,	7.5,	7.1,	7.2,	7.3,	7.4,	7.7,	7.7,	7.7,	8,	8.5,	8.8,	9,	9.1,	9.2,	9.4,	10.3,	11.8,	12.2,	12.5,	13.8,	14.2,	14,	14.1,	14.1,	14.3,	14.8,	15.2,	15.3,	15.5,	15.7,	15.9,	16.1,	16.4,	16.8,	17.5,	18.1,	18.8,	19.7,	20.3,	20.9,	21.9,	23.6,	26.2,	29,	31.1,	33.6,	36.6,	40.5,	44.7,	50.2,	56,	59.1,	61.5,	64.2,	67.3,	70.2,	72.8,	75.9,	79.2,	85,	86.6,	87.7,	86.6,	88.1,	89.5,	90.8,	92.1,	93.5,	95.8,	98,	100	,102.5,	104.5,	106.9,	108.7,	110.4,	112.7,	113.4,	114.8,	118.3,	120.8,	121.7,	123.4,	124.7,	125.6,	126.9,	129,	131.7,	132.8]
            if (courant){
                inflation=inflations[year-1929];
            }

            //Federal only
            for (let i = 1929; i < 1954; i++) { //1954
                let yearSelected=this.variableJson.data.filter((e: any) => e.year === i.toString())
                let taux_inflation=1
                if (courant){
                    taux_inflation=inflations[i-1929]/inflation;
                    // console.log("taux_inflation")
                    // console.log(taux_inflation)
                }
                let income_federal;
                if (yearSelected[0].hasOwnProperty('Fédéral montant de base')){
                    income_federal=Math.max((income-yearSelected[0]["Fédéral montant de base"])*taux_inflation,0);
                }
                else{
                    income_federal=income*taux_inflation;
                }
                // console.log("income_federal")
                // console.log(income_federal)

                // console.log(i)

                let total=0;
                let lastLevel=0;
                let indice=0;


                while(income_federal>lastLevel){
                    let current= yearSelected[indice];

                    if(current.hasOwnProperty('Fédéral Revenu imposable moins de ')){ lastLevel=current["Fédéral Revenu imposable moins de "]}
                    else{lastLevel=Number.MAX_VALUE;}

                    let bornSup=Math.min(income_federal,lastLevel);
                    total+=(bornSup-current["Fédéral Revenu imposable plus de "])*current["Fédéral taux"];

                    indice=indice+1;
                }
                if (taux){
                    total= total/(income*taux_inflation) *100;
                }
                // console.log("total")
                // console.log(total)
                federal.push([total.toFixed(2),i])
                provincial.push([0,i])
                combine.push([total,i])
            }

            //Provincial and Fédéral
            for (let i = 1954; i < 2021; i++) {
                //Data
                let yearSelected=this.variableJson.data.filter((e: any) => e.year === i.toString())

                //Inflation
                let taux_inflation=1
                if (courant){
                    taux_inflation=inflations[i-1929]/inflation;
                    // console.log("taux_inflation")
                    // console.log(taux_inflation)
                }

                let income_federal;
                let income_provincial;


                //Montant de base
                if (yearSelected[0].hasOwnProperty('Fédéral montant de base')){
                    income_federal=Math.max((income-yearSelected[0]["Fédéral montant de base"])*taux_inflation,0);
                }
                else{
                    income_federal=income*taux_inflation;
                }
                if (yearSelected[0].hasOwnProperty('Quebec Montant de base')){
                    income_provincial=Math.max((income-yearSelected[0]["Quebec Montant de base"])*taux_inflation,0);
                }
                else{
                    income_provincial=income*taux_inflation;
                }

                // console.log("income_federal")
                // console.log(income_federal)
                // console.log("income_provincial")
                // console.log(income_provincial)

                // console.log(i)

                let total_fédéral=0;
                let total_provincial=0;
                let lastLevel_fédéral=0;
                let lastLevel_provincial=0;
                let indice=0;


                while(income_federal>lastLevel_fédéral || income_provincial>lastLevel_provincial )
                {
                    let current= yearSelected[indice];

                    //Fédéral
                    if(income_federal>lastLevel_fédéral){
                        if(current.hasOwnProperty('Fédéral Revenu imposable moins de ')){ lastLevel_fédéral=current["Fédéral Revenu imposable moins de "]}
                        else{lastLevel_fédéral=Number.MAX_VALUE;}

                        let bornSup=Math.min(income_federal,lastLevel_fédéral);
                        total_fédéral+=(bornSup-current["Fédéral Revenu imposable plus de "])*current["Fédéral taux"];
                    }

                    //Provinciale
                    if(income_provincial>lastLevel_provincial){
                        if(current.hasOwnProperty('Quebec Revenu imposable moins de ')){ lastLevel_provincial=current["Quebec Revenu imposable moins de "]}
                        else{lastLevel_provincial=Number.MAX_VALUE;}

                        let bornSup=Math.min(income_provincial,lastLevel_provincial);
                        total_provincial+=(bornSup-current["Quebec Revenu imposable plus de "])*current["Quebec Taux"];
                    }

                    indice=indice+1;

                }

                //Taux ou Impôt?
                if (taux){
                    total_fédéral= total_fédéral/(income*taux_inflation)*100;
                    total_provincial= total_provincial/(income*taux_inflation)*100;
                }


                federal.push([total_fédéral.toFixed(2),i])
                provincial.push([total_provincial.toFixed(2),i])
                combine.push([(total_fédéral+total_provincial).toFixed(2),i])
            }

            console.log("federal:");
            console.log(federal);

            return [federal,provincial,combine]

        })

    }

    public extractSalaryRange(): any {
        //console.log("init");
        return d3.json('./assets/dataJson.txt').then((data: any) => {

            const data_fig2 = data.data;

            let federal_range:any;
            let provincial_range:any;
            let combine_range:any;
            let years_possible_customize: any;
            let all_data: any;

            all_data = []
            federal_range = [];
            provincial_range = [];
            combine_range = [];
            years_possible_customize = [];

            data_fig2.forEach((d: any) => {

                years_possible_customize.push(parseInt(d.year));

                if (d.hasOwnProperty("Quebec Revenu imposable plus de ")) {
                    provincial_range.push(parseInt(d["Quebec Revenu imposable plus de "]))
                }
                else {
                    provincial_range.push(null)
                }

                if (d.hasOwnProperty("Fédéral Revenu imposable plus de ")) {
                    federal_range.push(parseInt(d["Fédéral Revenu imposable plus de "]))
                }
                else {
                    federal_range.push(null)
                }

                if (d.hasOwnProperty("Combiné Revenu imposable plus de ")) {
                    combine_range.push(parseInt(d["Combiné Revenu imposable plus de "]))
                }
                else {
                    combine_range.push(null)
                }

            })
            console.log()
            return [years_possible_customize, federal_range, provincial_range, combine_range]

        })

    }

}


// "year": "1929",
// "Fédéral Revenu imposable plus de ": "0",
// "Fédéral Revenu imposable moins de ": "2000",
// "Fédéral taux": "0.02",
// "Fédéral montant de base": "1500",
// "Combiné Revenu imposable plus de ": "0",
// "Combiné Revenu imposable moins de ": "2000",
// "Combiné Taux": "0.02"

// "year": "1961",
// "Quebec Revenu imposable plus de ": "0",
// "Quebec Revenu imposable moins de ": "1000",
// "Quebec Taux": "0.025",
// "Fédéral Revenu imposable plus de ": "0",
// "Fédéral Revenu imposable moins de ": "1000",
// "Fédéral taux": "0.11",
// "Fédéral PSV": "3%, max 90$",
// "Fédéral montant de base": "1000",
// "Combiné Revenu imposable plus de ": "0",
// "Combiné Revenu imposable moins de ": "1000",
// "Combiné Taux": "0.135"