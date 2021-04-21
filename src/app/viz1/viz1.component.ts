import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

@Component({
    selector: 'app-viz1',
    templateUrl: './viz1.component.html',
    styleUrls: ['./viz1.component.scss']
})
export class Viz1Component {

    vizForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder
    ) {
        this.vizForm = this.formBuilder.group({
            income: new FormControl("", [Validators.required, Validators.min(0)]),
            year: new FormControl("", [Validators.required, Validators.min(1917), Validators.max(2020)]),
            typeMoney: new FormControl("", [Validators.required]),
            mode: new FormControl("", [Validators.required]),
        });
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

    onChange(): void {
        // TODO: send value
        console.log("on change")
    }

    getIncome(): number {
        if (this.vizForm.get("income")?.value < 0){
            console.log("00")
            return 0;
        }
        return this.vizForm.get("income")?.value;
    }
}
