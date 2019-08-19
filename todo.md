### David's requests 

* make a Treemap component 
* "Should have a zero line and then the bar is draw [above zero or below zero](https://www.google.com/url?sa=i&source=imgres&cd=&cad=rja&uact=8&ved=2ahUKEwiYpuOdnY_kAhVQSN8KHWfyBRoQjRx6BAgBEAQ&url=https%3A%2F%2Fwww.thedataschool.co.uk%2Ftimothy-manning%2Fmake-clean-diverging-bar-chart-tableau-tips-tableautimothy%2F&psig=AOvVaw2qWD1KCZuJJOyZWxLuAAu4&ust=1566314200280722) depending on value"
* line plot: I need it to take into account time, so my data range is time base not date passed

### L's bugbears

1)  bubble chart, sunburst: put in div center so doesn't look weird and offset

2)  punch card sizing is being obnoxious, check [this gist](https://gist.github.com/kaezarrex/10122633) for reference on how to fix

3)  pie chart text in center - DLG still wants that as a template we can play with, so we need to export the center coords I think? 

4)  bubble chart - should we add margin to make sure we see the entire bubble? make margin not a @Input()? 

5)  percentage sizing does not work unless the immediate parent element has explicit dimensions

6)  add xAxisAngle to line-plot 

