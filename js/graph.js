// Function to remove duplicates from arrays.

function unique(arr) {
 var m = {};
 var newarr = [];
 for (var i = 0; i < arr.length; i++) {
  var v = arr[i];
  if(!m[v]) {
   newarr.push(v);
   m[v] = true;
  }
 }
 return newarr;
}


// Function to turn histogrammed Likert data with into d3.stack arrays.

function likert(series, order) {
 if(!((n = series.length) > 1)) return;
 var mid = (order.length - 1) / 2;
 for(var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
  for(yp = yn = 0, i = Math.ceil(mid); i < n; ++i) {
   dy = (d = series[order[i]][j])[1] - d[0];
   if(i === mid) {
    yp += dy / 2;
   } else {
    d[0] = yp;
    d[1] = yp += dy;
   }
  }
  for(yp = yn = 0, i = Math.floor(mid); i >= 0; --i) {
   dy = (d = series[order[i]][j])[1] - d[0];
   if(i === mid) {
    d[1] = yp + dy / 2;
    d[0] = yp -= dy / 2;
   } else {
    d[1] = yp;
    d[0] = yp -= dy;
   }
  }
 }
}


// Function to parse and cast data from textarea.

function parseInput() {
 var input = d3.csvParse(d3.select('textarea').node().value, function(d, i, columns) {
  for(i = 2, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
  for(i = 2; i < columns.length; ++i) d[columns[i]] = d[columns[i]] / t;
  return d;
 });
 return input;
}


// Function to update barcharts.

function updateChart(data) {

 // Define categorical arrays from the data. This is needed early to define the size of the graphic.

 var group = function() { return d3.select('#transpose').property('checked') ? unique(data.map(function(d) { return d.Subgroup; })) : unique(data.map(function(d) { return d.Group; })); } ();
 var subgroup = function() { return d3.select('#transpose').property('checked') ? unique(data.map(function(d) { return d.Group; })) : unique(data.map(function(d) { return d.Subgroup; })); } ();
 var key = data.columns.slice(2);

 // Change font in stylesheet.

 var font = function() { return d3.select('#font-input').node().value ? d3.select('#font-input').node().value : 'courier'; } ();
 var sheet = document.styleSheets[1];
 sheet.deleteRule(2);
 sheet.insertRule('svg text { font-family: ' + font + '; font-size: 12px; }', 2);

 // Get bar width and height.

 var barWidth = function() { return d3.select('#bar-width').node().value ? +d3.select('#bar-width').node().value : 480; } ();
 var barHeight = function() { return d3.select('#bar-height').node().value ? +d3.select('#bar-height').node().value : 20; } ();

 // Apply basic formatting.

 var margin = {top:0, right:80, bottom:20, left:160};
 var yPadding = 40;
 var width = barWidth;
 var height = (barHeight * subgroup.length + yPadding) * group.length;
 var textPadding = yPadding * 0.25;

 var svg = d3.select('svg');
 svg.attr('width', width + margin.left + margin.right);
 svg.attr('height', height + margin.top + margin.bottom + yPadding * 2);

 var graph = svg.select('g.graph')
 graph.attr('transform', 'translate(' + margin.left + ',' + (margin.top + yPadding * 2) + ')');

 var title = svg.select('g.title')
 title.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

 // Define axes and color scales.

 var x = d3.scaleLinear()
 .domain([-1, 1])
 .rangeRound([0, width]);

 var xInverse = d3.scaleLinear()
 .domain([0, width])
 .range([0, 200]);

 var xLegend = d3.scaleBand()
 .domain(key)
 .rangeRound([width * 0.25, width * 0.75]);

 var y = d3.scaleBand()
 .domain(group)
 .rangeRound([0, height])
 .paddingInner(yPadding / (barHeight * subgroup.length + yPadding))
 .paddingOuter(yPadding / (barHeight * subgroup.length + yPadding) * 0.5);

 var yInnerPadding = 0.05;

 var yInner = d3.scaleBand()
 .domain(subgroup)
 .rangeRound([0, y.bandwidth()])
 .paddingInner(yInnerPadding * 2)
 .paddingOuter(yInnerPadding);

 var color = d3.scaleSequential(d3.interpolateRdBu)
 .domain([0, key.length - 1]);

 var colorText = d3.scaleQuantize()
 .domain([0, key.length - 1])
 .range(['white', 'black', 'black', 'black', 'black', 'black', 'white']);

 // Draw title.

 var titleText = function() { return d3.select('#title-input').node().value ? d3.select('#title-input').node().value : 'Title'; } ();

 var graphTitle = title.selectAll('#graph-title')
 .data([titleText]);

 graphTitle.attr('x', x(0))
 .attr('y', yPadding)
 .attr('dy', textPadding * -1)
 .text(function(d) { return d; });

 graphTitle.enter().append('text')
 .attr('id', 'graph-title')
 .attr('x', x(0))
 .attr('y', yPadding)
 .attr('dy', textPadding * -1)
 .text(function(d) { return d; });

 graphTitle.exit().remove();

 // Draw color legend.

 var colorLegend = title.selectAll('rect.color-legend')
 .data(key);

 colorLegend.attr('x', function(d) { return xLegend(d); })
 .attr('y', yPadding)
 .attr('width', xLegend.bandwidth())
 .attr('height', yPadding * 0.4)
 .attr('fill', function(d, i) { return color(i); });

 colorLegend.enter().append('rect')
 .classed('color-legend', true)
 .attr('x', function(d) { return xLegend(d); })
 .attr('y', yPadding)
 .attr('width', xLegend.bandwidth())
 .attr('height', yPadding * 0.4)
 .attr('fill', function(d, i) { return color(i); });

 colorLegend.exit().remove();

 var legendNegative = title.selectAll('#legend-negative')
 .data([key[0]]);

 legendNegative.attr('x', xLegend(key[0]))
 .attr('y', yPadding * 1.2)
 .attr('dx', textPadding * -1)
 .attr('dy', 3)
 .text(function(d) { return d; });

 legendNegative.enter().append('text')
 .attr('id', 'legend-negative')
 .attr('x', xLegend(key[0]))
 .attr('y', yPadding * 1.2)
 .attr('dx', textPadding * -1)
 .attr('dy', 3)
 .text(function(d) { return d; });

 var legendPositive = title.selectAll('#legend-positive')
 .data([key[key.length - 1]]);

 legendPositive.attr('x', xLegend(key[key.length - 1]) + xLegend.bandwidth())
 .attr('y', yPadding * 1.2)
 .attr('dx', textPadding)
 .attr('dy', 3)
 .text(function(d) { return d; });

 legendPositive.enter().append('text')
 .attr('id', 'legend-positive')
 .attr('x', xLegend(key[key.length - 1]) + xLegend.bandwidth())
 .attr('y', yPadding * 1.2)
 .attr('dx', textPadding)
 .attr('dy', 3)
 .text(function(d) { return d; });

 // Draw legends for groups and subgroups.

 var xHeader = graph.selectAll('text.x-header')
 .data(group);

 xHeader.attr('x', x(0))
 .attr('y', function(d) { return y(d); })
 .attr('dy', textPadding * -1 - 1)
 .attr('text-anchor', 'middle')
 .text(function(d) { return d; });

 xHeader.enter().append('text')
 .classed('x-header', true)
 .attr('x', x(0))
 .attr('y', function(d) { return y(d); })
 .attr('dy', textPadding * -1 - 1)
 .attr('text-anchor', 'middle')
 .text(function(d) { return d; });

 xHeader.exit().remove();

 var yAxis = graph.selectAll('g.y-axis')
 .data(group);

 yAxis.attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisLeft(yInner)
 .tickPadding(textPadding + 1)
 .tickSize(0));

 yAxis.enter().append('g')
 .classed('y-axis', true)
 .attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisLeft(yInner)
 .tickPadding(textPadding + 1)
 .tickSize(0));

 yAxis.exit().remove();

 // Draw grids.

 var grid = graph.selectAll('rect.grid')
 .data(group);

 grid.attr('x', x(-1) - 1)
 .attr('y', function(d) { return y(d) - barHeight * yInnerPadding - 1; })
 .attr('width', x(1) - x(-1) + 2)
 .attr('height', barHeight * (subgroup.length + yInnerPadding * 2) + 2);

 grid.enter().append('rect')
 .classed('grid', true)
 .attr('x', x(-1) - 1)
 .attr('y', function(d) { return y(d) - barHeight * yInnerPadding - 1; })
 .attr('width', x(1) - x(-1) + 2)
 .attr('height', barHeight * (subgroup.length + yInnerPadding * 2) + 2);

 grid.exit().remove();

 // Draw bars.

 var barGroup = graph.selectAll('g.bar-group')
 .data(d3.stack().keys(key).offset(likert)(data));

 barGroup.attr('fill', function(d) { return color(d.index); });

 var bar = barGroup.selectAll('rect.bar')
 .data(function(d) { return d; });

 bar.attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());

 bar.enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());

 bar.exit().remove();

 barGroup.enter().append('g')
 .classed('bar-group', true)
 .attr('fill', function(d) { return color(d.index); })
 .selectAll('rect')
 .data(function(d) { return d; })
 .enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());

 barGroup.exit().remove();

 // Add text to bars.

 if(d3.select('#hide-numbers').property('checked')) {

  graph.selectAll('g.bar-text-group').remove();

 } else {

  var barTextGroup = graph.selectAll('g.bar-text-group')
  .data(d3.stack().keys(key).offset(likert)(data));

  barTextGroup.attr('fill', function(d) { return colorText(d.index); });

  var barText = barTextGroup.selectAll('text.bar-text')
  .data(function(d) { return d; })

  barText.attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
  .attr('dy', barHeight * 0.5 + 3)
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });

  barText.enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
  .attr('dy', barHeight * 0.5 + 3)
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });

  barText.exit().remove();

  barTextGroup.enter().append('g')
  .classed('bar-text-group', true)
  .attr('fill', function(d) { return colorText(d.index); })
  .selectAll('text')
  .data(function(d) { return d; })
  .enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#transpose').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
  .attr('dy', barHeight * 0.5 + 3)
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });

  barTextGroup.exit().remove();

 }

}


// Initialize the graph on pageload with sample data.

var svg = d3.select('svg');
svg.append('g').classed('title', true);
svg.append('g').classed('graph', true);

d3.csv('data/sample.csv', function(d, i, columns) {
 for(i = 2, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
 for(i = 2; i < columns.length; ++i) d[columns[i]] = d[columns[i]] / t;
 return d;
}, function(data) {
 updateChart(data);
});


// Button listeners.

d3.select('#draw').on('click', function() {
 d3.event.preventDefault();
 if(d3.select('textarea').node().value) {
  updateChart(parseInput());
 } else {
  d3.csv('data/sample.csv', function(d, i, columns) {
   for(i = 2, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
   for(i = 2; i < columns.length; ++i) d[columns[i]] = d[columns[i]] / t;
   return d;
  }, function(data) {
   updateChart(data);
  });
 }
});

d3.select('#save').on('click', function() {
 d3.event.preventDefault();
 var e = document.createElement('script');
 e.setAttribute('src', 'https://nytimes.github.io/svg-crowbar/svg-crowbar.js');
 e.setAttribute('class', 'svg-crowbar');
 document.body.appendChild(e);
});