

# NgCatalyst [![npm version](https://badge.fury.io/js/ngcatalyst.svg)](https://badge.fury.io/js/ngcatalyst)
>An Angular component library of data visualizations 

## Angular Compatibility 

|ngCatalyst|Angular|
|-|-|
|0.2.5|7.x|
|1.x.x|8.x|

If using with Angular 7 run command `npm install ngcatalyst@0.2.5 --save`

## How to Use

#### Install the package
`npm install ngcatalyst --save`

#### Import Module into your App
Add `NgCatalystModule` to `imports` in `src/app/app.module.ts`:

```typescript
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";

import { NgcatalystModule } from "ngcatalyst";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgcatalystModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
``` 
#### Include Styles 
In your `angular.json`
```json
// In angular.json under architect > build > options > styles
// add "node_modules/ngcatalyst/lib/styles.css"
{
    "projects": {
        "your-project": {
            "architect": {
                "build": {
                    "options": {
                        "styles": [
                            "src/styles.css", 
                            "node_modules/ngcatalyst/lib/styles.css"
                        ]
                    }
                }
            }
        }
    }
}
```

#### Use in your App
In your `app.component.html`
```html
<!-- Example with a bar chart and props defined in app.component.ts -->
<eikos-bar-chart 
    [data]="barData" 
    [xAxisLabel]="xAxisLabel" 
    [yAxisLabel]="yAxisLabel" 
    [propID]="barPropID"
    [colors]="barColors" 
    [title]="barTitle"
    (clickEvent)="clickEventEmit($event)">
</eikos-bar-chart>
```


## Check out the examples repo

A repo containing an example app with all of the visualizations availble can be found [here](https://github.com/EikosPartners/ngcatalyst-examples). Please clone that repo, `npm install` and run `ng serve`.
