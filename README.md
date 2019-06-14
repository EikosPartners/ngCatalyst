# How to use ngcatalyst 

## Check out the test repo

`npm install` from root directory 

`ng serve` 

check out [http://localhost:4200](http://localhost:4200) to see the visualizations in action

to explore how the various @Input properties behave, modify them in `projects/ngcatalyst-tester/src/app/app.component.ts`

## Use from npm 

`npm install --save ngcatalyst`

then: go to angular.json, and add `"node_modules/ngcatalyst/lib/styles.css"` to the "styles" array (under "architect": "build")
