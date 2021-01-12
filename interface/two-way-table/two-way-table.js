// settings...
const visFormat = "icons"; // "text", "icons", "bars"
const interactive = true; // true, false

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


// data (will end up loading dynamically)
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


// table format...
const rowHeaderFormat = [
    { head: 'Gene', cl: 'label center', colspan: 1, rowspan: 2 }
];

const columnHeaderFormat = [
    { head: '', cl: 'blank center', colspan: 2, rowspan: 2 },
    { head: 'Immunotherapy', cl: 'label center', colspan: 2, rowspan: 1 }
];

const rows = [
    {   // with the gene
        'head': "Yes", 
        'scope': 'row', 
        'rowspan': 1,
        'nTreat': data.nA,
        'cancerTreat': data.A,
        'nNoTreat': data.nC,
        'cancerNoTreat': data.C
    },
    {   // without the gene
        'head': "No",
        'scope': 'row', 
        'rowspan': 1,
        'nTreat': data.nB,
        'cancerTreat': data.B,
        'nNoTreat': data.nD,
        'cancerNoTreat': data.D
    },
    {   // without the gene
        'head': "All",
        'scope': 'rowgroup', 
        'rowspan': 2,
        'nTreat': data.nA + data.nB,
        'cancerTreat': data.A + data.B,
        'nNoTreat': data.nC + data.nD,
        'cancerNoTreat': data.C + data.D
    },
];

const columns = [
    {
        head: 'Yes', cl: 'chartTreat center', scope: 'col', colspan: 1,
        html: function (row, i) { 
            // render table data
            return renderData(i, '.chartTreat', row.cancerTreat, row.nTreat);
        }
    },
    {
        head: 'No', cl: 'chartNoTreat center', scope: 'col', colspan: 1,
        html: function (row, i) { 
            // render table data  
            return renderData(i, '.chartNoTreat', row.cancerNoTreat, row.nNoTreat); 
        }
    },
    {
        head: 'All', cl: 'chartAll center', scope: 'colgroup', colspan: 2,
        html: function (row, i) { 
            // render table data 
            return renderData(i, '.chartAll', (row.cancerTreat + row.cancerNoTreat), (row.nTreat + row.nNoTreat)); 
        }
    }
];


// reused variables
// var table,
    // colHeader,
    // body, 
    // rowSelection,
var useRows,
    useColumns,
    collapseRow = false,
    collapseCol = false;

// filter view based on interaction (default to disaggregated rows and columns)
function filterView() {
    if (collapseRow) {
        useRows = rows.filter(function (row) { return row.head == "All"; });
    } else {
        useRows = rows.filter(function (row) { return row.head == "Yes" || row.head == "No"; });
    }
    if (collapseCol) {
        useColumns = columns.filter(function (col) { return col.head == "All"; });
    } else {
        useColumns = columns.filter(function (col) { return col.head == "Yes" || col.head == "No"; });
    }
}

// initialize table
function createTable () {
    // create table
    var table = d3.select('#table')
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
        .text(function (d) { return d.head; })
        .on('click', function () { 
            if (interactive) {
                // toggle column aggregation
                collapseCol = !collapseCol;
                // aggregate the data how we are going to show it
                filterView();
                // re-render table
                updateTable();
            }
        });

    // append column sub-headers
    table.append('tr')
        .attr('class', 'col-sub-header')
        .selectAll('th')
        .data(useColumns)
        .enter()
        .append('th')
        .attr('class', 'label center')
        .attr('colspan', function (col) { return col.colspan; })
        .attr('scope', function (col) { return col.scope; })
        .text(function (col) { return col.head; });

    // create table body
    var body = table.append('tbody')
    
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
        .text(function (d) { return d.head; })
        .on('click', function () { 
            if (interactive) {
                // toggle row aggregation
                collapseRow = !collapseRow;
                // aggregate the data how we are going to show it
                filterView();
                // re-render table
                updateTable();
            }
        });
    
    // select rows, bind data, makes sure we have the right number of elements, and join selections
    var rowSelection = body.selectAll('tr')
        .data(useRows)
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
    rowSelection.attr('id', function (row, i) { return 'r' + i; });
    // append row sub-headers
    rowHeader = rowSelection.append('th')
        .attr('class', 'label center row-sub-header')
        .attr('rowspan', function (row) { return row.rowspan; })
        .attr('scope', function (row) { return row.scope; })
        .text(function (row) { return row.head; });     
    // append table data
    rowSelection.selectAll('td')
        .data(function (row, i) {
            return useColumns.map(function (c) {
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
}

// re-render table
function updateTable () {
    // console.log("use col", useColumns);
    // console.log("use row", useRows);
    
    // update column sub-headers
    d3.select('.col-sub-header').selectAll('th').data(useColumns)
        .join(
            function(enter) {
                // append new column sub-header if need be
                return enter.append('th')
                    .attr('class', 'label center');
            },
            function(update) {
                // will handle updating of joined set below
                return update;
            },
            function(exit) {
                // remove column sub-header if need be
                return exit.remove();
            }
        )
        .attr('colspan', function (col) { return col.colspan; })
        .attr('scope', function (col) { return col.scope; })
        .text(function (col) { return col.head; });

    // update rows...
    // selection and binding; handle enter, update, and exit set
    var rowSelection = d3.select('tbody').selectAll('tr').data(useRows)
        .join(
            function(enter) {
                // append new table rows if need be
                var enterRows = enter
                    .append('tr')
                    .attr('id', function (row, i) { return 'r' + i; }); // number new rows
                
                // also append new table headers for new rows, but don't change final selection (need to return rows, not headers)
                enterRows.append('th') 
                    .attr('class', 'label center row-sub-header');

                return enterRows;
            },
            function(update) {
                // will handle updating of joined set below
                return update;
            },
            function(exit) {
                // remove table rows if need be
                return exit.remove();
            }
        );

    // update row sub-headers
    rowSelection.select('.row-sub-header')
        .attr('rowspan', function (row) { return row.rowspan; })
        .attr('scope', function (row) { return row.scope; })
        .text(function (row) { return row.head; });
    
    // update table data
    rowSelection.selectAll('td')
        .data(function (row, i) {
            return useColumns.map(function (c) {
                // use columns to set cell values for this specific row
                var cell = {};
                d3.keys(c).forEach(function (k) {
                    cell[k] = typeof c[k] == 'function' ? c[k](row, i) : c[k];
                });

                return cell;
            })
        }).join(
            function(enter) {
                // enter new table data
                return enter.append('td');
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
        .html(function (col) { return col.html; })
        .attr('class', function (col) { return col.cl });
}

// render table data
function renderData (index, selectionClass, numerator, denominator) {
    // render table data  
    if (visFormat == "text") {
        // return fraction
        return numerator + " / " + denominator;
    } else if (visFormat == "icons") {
        // wait until the DOM is ready so that td.chart exists
        $(function () {
            // select the current row's table data cell classed 'chartTreat'
            var currRow = document.getElementById('r' + index);
            var chart = currRow.querySelector(selectionClass);
            var nDotCol = selectionClass == ".chartAll" ? 2 * dotsPerLine : dotsPerLine;

            
            // reformat data for icon array, one object per dot
            var dotData = [];
            for (let i = 0; i < denominator; i ++) {
                dotData.push({
                    'iRow': Math.floor(i / nDotCol) + 1,
                    'iCol': i % nDotCol + 1,
                    'cancer': (i < numerator)
                });
            }

            // append svg to td.chartAll
            if (d3.select(chart).select('svg').empty()) {
                d3.select(chart).append('svg');
            }
            var svg = d3.select(chart).select('svg')
                .attr('class', 'icon-dots')
                .attr('width', 2 * dotRadius * nDotCol + 10)
                .attr('height', 2 * dotRadius * dotData.reduce(function (prev, current) { return (prev.iRow < current.iRow) ? current : prev; }).iRow + 10);

            // append chart wrapper
            if (svg.select('g').empty()) {
                svg.append('g').attr('class', 'chartWrapper');
            }
            var chartWrapper = svg.select('.chartWrapper');
            
            // bind data and render dots
            chartWrapper.selectAll('circle').data(dotData)
                .join(
                    function (enter) {
                        // append new circles if need be
                        return enter
                            .append('circle')
                            .attr('r', dotRadius)
                            .attr('stroke', 'black')
                    },
                    function(update) {
                        // will handle updating of joined set below
                        return update;
                    },
                    function(exit) {
                        // remove circles if need be
                        return exit.remove();
                    }
                )
                // set cicle attributes depending on data
                .attr('cx', function (d) { return dotRadius * (2 * d.iCol + 1); })
                .attr('cy', function (d) { return dotRadius * (2 * d.iRow + 1); })
                .attr('fill', function (d) { return d.cancer ? fillColor : 'none'; });
        });
    } else if (visFormat == "bars") {

    }
} 

// main
$(document).ready(function() {
    // aggregate the data how we are going to show it
    filterView();

    // initialize the table
    createTable();
});