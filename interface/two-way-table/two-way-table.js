// settings...
const visFormat = "icons"; // "text", "icons", "bars"
const interactive = false; // true, false

// icon arrays of dots
const dotRadius = 3; // pixels
const fillColor = '#a034ed';
const dotsPerLine = 50;

// size
const svgWidth = 760,
    svgHeight = 560,
    margin = { top: 30, right: 30, bottom: 30, left: 30 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom; 


// data...
const data = {
    'nA': 1247, 
    'nB': 1261,
    'nC': 1296, 
    'nD': 1250,
    'A': 301,
    'B': 3,
    'C': 391,
    'D': 4
};

const rowData = [
    {   // with the gene
        'head': "Yes",
        'nTreat': data.nA,
        'cancerTreat': data.A,
        'nNoTreat': data.nC,
        'cancerNoTreat': data.C
    },
    {   // without the gene
        'head': "No",
        'nTreat': data.nB,
        'cancerTreat': data.B,
        'nNoTreat': data.nD,
        'cancerNoTreat': data.D
    },
]

// table format...
const columnHeaderFormat = [
    { head: '', cl: 'blank center', colspan: 2, rowspan: 2 },
    { head: 'Immunotherapy', cl: 'label center', colspan: 2, rowspan: 1 }
];

const rowHeaderFormat = [
    { head: 'Gene', cl: 'label center', colspan: 1, rowspan: 2 }
];

const columns = [
    {
        head: 'Yes', cl: 'chartTreat center',  
        html: function (row, i) { 
            // render table data
            if (visFormat == "text") {
                // return fraction
                return row.cancerTreat + " / " + row.nTreat;
            } else if (visFormat == "icons") {
                // wait until the DOM is ready so that td.chart exists
                $(function () {
                    // select the current row's table data cell classed 'chartTreat'
                    console.log("row number", i);
                    var currRow = document.getElementById('r' + i);
                    var chart = currRow.querySelector('.chartTreat');
                    
                    // reformat data for icon array, one object per dot
                    var dotData = [];
                    for (let i = 0; i < row.nTreat; i ++) {
                        dotData.push({
                            'iRow': Math.floor(i / dotsPerLine) + 1,
                            'iCol': i % dotsPerLine + 1,
                            'cancer': (i < row.cancerTreat)
                        });
                    }

                    // append svg to td.chartTreat
                    if (d3.select(chart).select('svg').empty()) {
                        d3.select(chart).append('svg');
                    }
                    var svg = d3.select(chart).select('svg')
                        .attr('class', 'icon-dots')
                        .attr('width', 2 * dotRadius * dotsPerLine + 10)
                        .attr('height', 2 * dotRadius * dotData.reduce(function (prev, current) { return (prev.iRow < current.iRow) ? current : prev; }).iRow + 10);

                    // append chart wrapper
                    var chartWrapper = svg.append('g').attr('class', 'chartWrapper');
                    
                    // bind data and render dots
                    chartWrapper.selectAll('circle').data(dotData)
                        .enter()
                        .append('circle')
                        .attr('r', dotRadius)
                        .attr('cx', function (d) { return dotRadius * (2 * d.iCol + 1); })
                        .attr('cy', function (d) { return dotRadius * (2 * d.iRow + 1); })
                        .attr('fill', function (d) { return d.cancer ? fillColor : 'none'; })
                        .attr('stroke', 'black');
                });
            } else if (visFormat == "bars") {

            }
        }
    },
    {
        head: 'No', cl: 'chartNoTreat center',
        html: function (row, i) { 
            // render table data  
            if (visFormat == "text") {
                // return fraction
                return row.cancerNoTreat + " / " + row.nNoTreat;
            } else if (visFormat == "icons") {
                // wait until the DOM is ready so that td.chart exists
                $(function () {
                    // select the current row's table data cell classed 'chartTreat'
                    console.log("row number", i);
                    var currRow = document.getElementById('r' + i);
                    var chart = currRow.querySelector('.chartNoTreat');
                    
                    // reformat data for icon array, one object per dot
                    var dotData = [];
                    for (let i = 0; i < row.nNoTreat; i ++) {
                        dotData.push({
                            'iRow': Math.floor(i / dotsPerLine) + 1,
                            'iCol': i % dotsPerLine + 1,
                            'cancer': (i < row.cancerNoTreat)
                        });
                    }

                    // append svg to td.chartTreat
                    if (d3.select(chart).select('svg').empty()) {
                        d3.select(chart).append('svg');
                    }
                    var svg = d3.select(chart).select('svg')
                        .attr('class', 'icon-dots')
                        .attr('width', 2 * dotRadius * dotsPerLine + 10)
                        .attr('height', 2 * dotRadius * dotData.reduce(function (prev, current) { return (prev.iRow < current.iRow) ? current : prev; }).iRow + 10);

                    // append chart wrapper
                    var chartWrapper = svg.append('g').attr('class', 'chartWrapper');
                    
                    // bind data and render dots
                    chartWrapper.selectAll('circle').data(dotData)
                        .enter()
                        .append('circle')
                        .attr('r', dotRadius)
                        .attr('cx', function (d) { return dotRadius * (2 * d.iCol + 1); })
                        .attr('cy', function (d) { return dotRadius * (2 * d.iRow + 1); })
                        .attr('fill', function (d) { return d.cancer ? fillColor : 'none'; })
                        .attr('stroke', 'black');
                });
            } else if (visFormat == "bars") {

            }
        }
    }
];


// create table (main)
var table, body, rows, enterRows;

$(document).ready(function() {
    // create table
    table = d3.select('#table')
        .append('table')
        .attr('class', 'table table-bordered');

    // append column header
    table.append('tr')
        .selectAll('th')
        .data(columnHeaderFormat)
        .enter()
        .append('th')
        .attr('class', function (d) { return d.cl; })
        .attr('colspan', function (d) { return d.colspan; })
        .attr('rowspan', function (d) { return d.rowspan; })
        .attr('scope', 'colgroup')
        .text(function (d) { return d.head; });

    // append column sub-headers
    table.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .attr('class', 'label center')
        .attr('scope', 'col')
        .text(function (col) { return col.head; })

    // create table body
    body = table.append('tbody')
    
    // append row header (create a row, meaning that our two body rows will be in the update and enter set, respectively)
    body.append('tr')
        .selectAll('th')
        .data(rowHeaderFormat)
        .enter()
        .append('th')
        .attr('class', function (d) { return d.cl; })
        .attr('colspan', function (d) { return d.colspan; })
        .attr('rowspan', function (d) { return d.rowspan; })
        .attr('scope', 'rowgroup')
        .text(function (d) { return d.head; });
    
    // select rows, bind data, makes sure we have the right number of elements, and join selections
    rows = body.selectAll('tr')
        .data(rowData)
        .join(
            function(enter) {
                // append new table rows if need be
                return enter.append('tr');
            },
            function(update) {
                // will handle updating of joined set below
                return update;
            },
            function(exit) {
                // remove table rows if need be
                return exit.remove();
            }
        )

    // number rows
    rows.attr('id', function (row, i) { return 'r' + i; });
    // append row sub-headers
    rows.append('th')
        .attr('class', 'label center')
        .attr('scope', 'row')
        .text(function (row) { return row.head; });        
    // append table data
    rows.selectAll('td')
        .data(function (row, i) {
            return columns.map(function (c) {
                // use columns to set cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function (k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
                });

                return cell;
            })
        }).enter() //enter table data
        .append('td')
        .html(function (col) { return col.html; })
        .attr('class', function (col) { return col.cl });

    // caption
    table.append('caption')
        .text(interactive ? "Interactive " + visFormat : "Static " + visFormat);
});