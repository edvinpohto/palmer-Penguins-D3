import * as Scatter from './scatterplot/scatterplot.js';
import * as Hist from './histogram/histogram.js';

const datapath = "./data/penguins_lter.csv";

d3.csv(datapath)
    .then((data) => {
        Hist.showHist(data, 0, "bodyMass");
        Hist.showHist(data, 1, "flipperLength");
        Hist.showHist(data, 2, "culmenLength");
        Hist.showHist(data, 3, "culmenDepth");

        Scatter.scatterplot()
    })