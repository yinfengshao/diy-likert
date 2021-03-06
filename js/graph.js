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


// Function to update bar color scheme.
function setBarColor(key) {
 switch(d3.select('input[name="color-choice"]:checked').node().value) {
  case 'red-blue':
   var color = d3.scaleSequential(d3.interpolateRdBu);
   break;
  case 'red-yellow-green':
   var color = d3.scaleSequential(d3.interpolateRdYlGn);
   break;
  case 'pink-green':
   var color = d3.scaleSequential(d3.interpolatePiYG);
   break;
  case 'purple-orange':
   var color = d3.scaleSequential(d3.interpolatePuOr);
   break;
 }
 color.domain([0, key.length - 1]);
 return color;
}


// Function to update bar text color scheme.
function setBarColorText(key) {
 var colorText = d3.scaleQuantize()
 .domain([0, key.length - 1])
 .range(['white', 'black', 'black', 'black', 'black', 'black', 'white']);
 return colorText;
}


// Function to update overall graph size.
function updateGraphSize(width, height, margin, yPadding) {
 var svg = d3.select('svg').attr('width', width + margin.left + margin.right)
 .attr('height', height + margin.top + margin.bottom + yPadding * 2);
 svg.select('g.graph').attr('transform', 'translate(' + margin.left + ',' + (margin.top + yPadding * 2) + ')');
 svg.select('g.title').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
}


// Function to change font.
function changeFont() {
 var font = function() { return d3.select('#font-input').node().value ? d3.select('#font-input').node().value : 'courier'; } ();
 var sheet = document.styleSheets[1];
 sheet.deleteRule(2);
 sheet.insertRule('svg text { font-family: ' + font + '; font-size: 12px; }', 2);
} 


// Function to draw title.
function drawTitle(width, yPadding) {
 var titleText = function() { return d3.select('#title-input').node().value ? d3.select('#title-input').node().value : 'Title'; } ();
 var graphTitle = d3.select('svg').select('g.title').selectAll('#graph-title').data([titleText]);
 graphTitle.attr('x', width * 0.5)
 .attr('y', yPadding)
 .attr('dy', yPadding * -0.25)
 .text(function(d) { return d; });
 graphTitle.enter().append('text')
 .attr('id', 'graph-title')
 .attr('x', width * 0.5)
 .attr('y', yPadding)
 .attr('dy', yPadding * -0.25)
 .text(function(d) { return d; });
 graphTitle.exit().remove();
}


// Function to draw color legend.
function drawColorLegend(key, color, width, yPadding) {
 // Define x scale for colors.
 var xLegend = d3.scaleBand()
 .domain(key)
 .rangeRound([width * 0.25, width * 0.75]);
 // Draw color rectangles.
 var colorLegend = d3.select('svg').select('g.title').selectAll('rect.color-legend').data(key);
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
 // Add text for left-most value.
 var legendNegative = d3.select('svg').select('g.title').selectAll('#legend-negative').data([key[0]]);
 legendNegative.attr('x', xLegend(key[0]))
 .attr('y', yPadding * 1.2)
 .attr('dx', yPadding * -0.25)
 .attr('dy', '0.32em')
 .text(function(d) { return d; });
 legendNegative.enter().append('text')
 .attr('id', 'legend-negative')
 .attr('x', xLegend(key[0]))
 .attr('y', yPadding * 1.2)
 .attr('dx', yPadding * -0.25)
 .attr('dy', '0.32em')
 .text(function(d) { return d; });
 // Add text for right-most value.
 var legendPositive = d3.select('svg').select('g.title').selectAll('#legend-positive').data([key[key.length - 1]]);
 legendPositive.attr('x', xLegend(key[key.length - 1]) + xLegend.bandwidth())
 .attr('y', yPadding * 1.2)
 .attr('dx', yPadding * 0.25)
 .attr('dy', '0.32em')
 .text(function(d) { return d; });
 legendPositive.enter().append('text')
 .attr('id', 'legend-positive')
 .attr('x', xLegend(key[key.length - 1]) + xLegend.bandwidth())
 .attr('y', yPadding * 1.2)
 .attr('dx', yPadding * 0.25)
 .attr('dy', '0.32em')
 .text(function(d) { return d; });
}


// Function to draw borders.
function drawBorder(group, y, width) {
 var border = d3.select('svg').select('g.graph').selectAll('rect.border').data(group);
 if(d3.select('#hide-borders').property('checked')) {
  border.remove();
 } else {
  border.attr('x', -1)
  .attr('y', function(d) { return y(d) - 2; })
  .attr('width', width + 2)
  .attr('height', y.bandwidth() + 4);
  border.enter().append('rect')
  .classed('border', true)
  .attr('x', -1)
  .attr('y', function(d) { return y(d) - 2; })
  .attr('width', width + 2)
  .attr('height', y.bandwidth() + 4);
  border.exit().remove();
 }
}

 
// Function to update chart with horizontal bars.
function updateChartHorizontal(data) {
 // Define categorical arrays from the data. This is needed early to define the size of the graphic.
 var group = function() { return d3.select('#cluster').property('checked') ? unique(data.map(function(d) { return d.Subgroup; })) : unique(data.map(function(d) { return d.Group; })); } ();
 var subgroup = function() { return d3.select('#cluster').property('checked') ? unique(data.map(function(d) { return d.Group; })) : unique(data.map(function(d) { return d.Subgroup; })); } ();
 var key = data.columns.slice(2);

 // Set basic dimensions.
 var barWidth = function() { return d3.select('#bar-width').node().value ? +d3.select('#bar-width').node().value : 480; } ();
 var barHeight = function() { return d3.select('#bar-height').node().value ? +d3.select('#bar-height').node().value : 40; } ();
 var margin = {top:0, right:80, bottom:20, left:160};
 var yPadding = 40;
 var width = barWidth;
 var height = (barHeight * subgroup.length + yPadding) * group.length;
 var svg = d3.select('svg');
 var graph = svg.select('g.graph');
 var title = svg.select('g.title');
 var color = setBarColor(key);
 var colorText = setBarColorText(key);
 updateGraphSize(width, height, margin, yPadding);
 changeFont();

 // Draw header.
 drawTitle(width, yPadding);
 drawColorLegend(key, color, width, yPadding);

 // Define axes.
 var x = d3.scaleLinear()
 .domain([-1, 1])
 .rangeRound([0, width]);
 var xInverse = d3.scaleLinear()
 .domain([0, width])
 .range([0, 200]);
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

 // Draw borders for groups.
 drawBorder(group, y, width);

 // Draw headers for groups.
 var xHeader = graph.selectAll('text.x-header').data(group);
 xHeader.attr('x', 0 /*x(0)*/ )
 .attr('y', function(d) { return y(d); })
 .attr('dx', 0)
 .attr('dy', yPadding * -0.25)
 // .attr('text-anchor', 'middle')
 .text(function(d) { return d; });
 xHeader.enter().append('text')
 .classed('x-header', true)
 .attr('x', 0 /*x(0)*/ )
 .attr('y', function(d) { return y(d); })
 .attr('dx', 0)
 .attr('dy', yPadding * -0.25)
 // .attr('text-anchor', 'middle')
 .text(function(d) { return d; });
 xHeader.exit().remove();

 // Draw legends for subgroups.
 graph.selectAll('g.y-axis').remove();
 var yAxis = graph.selectAll('g.y-axis').data(group);
 yAxis.attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisLeft(yInner)
 .tickPadding(yPadding * 0.25)
 .tickSize(0));
 yAxis.enter().append('g')
 .classed('y-axis', true)
 .attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisLeft(yInner)
 .tickPadding(yPadding * 0.25)
 .tickSize(0));
 yAxis.exit().remove();

 // Draw bars.
 var barGroup = graph.selectAll('g.bar-group').data(d3.stack().keys(key).offset(likert)(data));
 barGroup.attr('fill', function(d) { return color(d.index); });
 // Nested update for existing bar-groups.
 var bar = barGroup.selectAll('rect.bar').data(function(d) { return d; });
 bar.attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());
 bar.enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());
 bar.exit().remove();
 // End nested update.
 barGroup.enter().append('g')
 .classed('bar-group', true)
 .attr('fill', function(d) { return color(d.index); })
 .selectAll('rect')
 .data(function(d) { return d; })
 .enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return x(d[0]); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) : y(d.data['Group']) + yInner(d.data['Subgroup']); })
 .attr('width', function(d) { return x(d[1]) - x(d[0]); })
 .attr('height', yInner.bandwidth());
 barGroup.exit().remove();

 // Add text to bars.
 var barTextGroup = graph.selectAll('g.bar-text-group').data(d3.stack().keys(key).offset(likert)(data));
 if(d3.select('#hide-percentages').property('checked')) {
  barTextGroup.remove();
 } else {
  barTextGroup.attr('fill', function(d) { return colorText(d.index); });
  // Nested update for existing bar-text-groups.
  var barText = barTextGroup.selectAll('text.bar-text').data(function(d) { return d; })
  barText.attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) + barHeight * (0.5 - yInnerPadding) : y(d.data['Group']) + yInner(d.data['Subgroup']) + barHeight * (0.5 - yInnerPadding); })
  .attr('dy', '0.32em')
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });
  barText.enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) + barHeight * (0.5 - yInnerPadding) : y(d.data['Group']) + yInner(d.data['Subgroup']) + barHeight * (0.5 - yInnerPadding); })
  .attr('dy', '0.32em')
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });
  barText.exit().remove();
  // End nested update.
  barTextGroup.enter().append('g')
  .classed('bar-text-group', true)
  .attr('fill', function(d) { return colorText(d.index); })
  .selectAll('text')
  .data(function(d) { return d; })
  .enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return (x(d[0]) + x(d[1])) / 2; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d.data['Group']) + barHeight * (0.5 - yInnerPadding) : y(d.data['Group']) + yInner(d.data['Subgroup']) + barHeight * (0.5 - yInnerPadding); })
  .attr('dy', '0.32em')
  .text(function(d) { return (x(d[1]) - x(d[0])) > 7 ? Math.round(xInverse(x(d[1]) - x(d[0]))) : ''; });
  barTextGroup.exit().remove();
 }
}


// Function to update chart with vertical bars.
function updateChartVertical(data) {
 // Define categorical arrays from the data. This is needed early to define the size of the graphic.
 var group = function() { return d3.select('#cluster').property('checked') ? unique(data.map(function(d) { return d.Subgroup; })) : unique(data.map(function(d) { return d.Group; })); } ();
 var subgroup = function() { return d3.select('#cluster').property('checked') ? unique(data.map(function(d) { return d.Group; })) : unique(data.map(function(d) { return d.Subgroup; })); } ();
 var key = data.columns.slice(2);

 // Set basic dimensions.
 var barWidth = function() { return d3.select('#bar-width').node().value ? +d3.select('#bar-width').node().value : 80; } ();
 var barHeight = function() { return d3.select('#bar-height').node().value ? +d3.select('#bar-height').node().value : 240; } ();
 var margin = {top:0, right:80, bottom:20, left:160};
 var yPadding = 40;
 var width = barWidth * subgroup.length;
 var height = (barHeight + yPadding) * group.length;
 var svg = d3.select('svg');
 var graph = svg.select('g.graph');
 var title = svg.select('g.title');
 var color = setBarColor(key);
 var colorText = setBarColorText(key);
 updateGraphSize(width, height, margin, yPadding);
 changeFont();

 // Draw header.
 drawTitle(width, yPadding);
 drawColorLegend(key, color, width, yPadding);

 // Define axes.
 var xPadding = 0.05;
 var x = d3.scaleBand()
 .domain(subgroup)
 .rangeRound([0, width])
 .paddingInner(xPadding * 2)
 .paddingOuter(xPadding);
 var y = d3.scaleBand()
 .domain(group)
 .rangeRound([0, height])
 .paddingInner(yPadding / (barHeight + yPadding))
 .paddingOuter(yPadding / (barHeight + yPadding) * 0.5);
 var yInner = d3.scaleLinear()
 .domain([1, -1])
 .rangeRound([0, y.bandwidth()]);
 var yInnerInverse = d3.scaleLinear()
 .domain([0, y.bandwidth()])
 .range([0, 200]);

 // Draw borders for groups.
 drawBorder(group, y, width);

 // Draw headers for groups.
 // xHeader keeps its name from updateChartHorizontal even though it is now a y-axis header. This is so it updates correctly on refresh.
 var xHeader = graph.selectAll('text.x-header').data(group);
 xHeader.attr('x', 0)
 .attr('y', function(d) { return y(d) + y.bandwidth() * 0.5; })
 .attr('dx', yPadding * -0.25)
 .attr('dy', '0.32em')
 .attr('text-anchor', 'end')
 .text(function(d) { return d; });
 xHeader.enter().append('text')
 .classed('x-header', true)
 .attr('x', 0)
 .attr('y', function(d) { return y(d) + y.bandwidth() * 0.5; })
 .attr('dx', yPadding * -0.25)
 .attr('dy', '0.32em')
 .attr('text-anchor', 'end')
 .text(function(d) { return d; });
 xHeader.exit().remove();

 // Draw legends for subgroups.
 // yAxis keeps its name from updateChart even though it is now an x-axis legend. This is so it updates correctly on refresh.
 graph.selectAll('g.y-axis').remove();
 var yAxis = graph.selectAll('g.y-axis').data(group);
 yAxis.attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisTop(x)
 .tickPadding(yPadding * 0.25)
 .tickSize(0));
 yAxis.enter().append('g')
 .classed('y-axis', true)
 .attr('transform', function(d) { return 'translate(0, ' + y(d) + ')'; })
 .call(d3.axisTop(x)
 .tickPadding(yPadding * 0.25)
 .tickSize(0));
 yAxis.exit().remove();

 // Draw bars.
 var barGroup = graph.selectAll('g.bar-group').data(d3.stack().keys(key).offset(likert)(data));
 barGroup.attr('fill', function(d) { return color(d.index); });
 // Nested update for existing bar-groups.
 var bar = barGroup.selectAll('rect.bar').data(function(d) { return d; });
 bar.attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) : x(d.data['Subgroup']); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d[1]) : y(d.data['Group']) + yInner(d[1]); })
 .attr('width', x.bandwidth())
 .attr('height', function(d) { return yInner(d[0]) - yInner(d[1]); });
 bar.enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) : x(d.data['Subgroup']); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d[1]) : y(d.data['Group']) + yInner(d[1]); })
 .attr('width', x.bandwidth())
 .attr('height', function(d) { return yInner(d[0]) - yInner(d[1]); });
 bar.exit().remove();
 // End nested update.
 barGroup.enter().append('g')
 .classed('bar-group', true)
 .attr('fill', function(d) { return color(d.index); })
 .selectAll('rect')
 .data(function(d) { return d; })
 .enter().append('rect')
 .classed('bar', true)
 .attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) : x(d.data['Subgroup']); })
 .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + yInner(d[1]) : y(d.data['Group']) + yInner(d[1]); })
 .attr('width', x.bandwidth())
 .attr('height', function(d) { return yInner(d[0]) - yInner(d[1]); });
 barGroup.exit().remove();

 // Add text to bars.
 var barTextGroup = graph.selectAll('g.bar-text-group').data(d3.stack().keys(key).offset(likert)(data));
 if(d3.select('#hide-percentages').property('checked')) {
  barTextGroup.remove();
 } else {
  barTextGroup.attr('fill', function(d) { return colorText(d.index); });
  // Nested update for existing bar-text-groups.
  var barText = barTextGroup.selectAll('text.bar-text').data(function(d) { return d; })
  barText.attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) + x.bandwidth() * 0.5 : x(d.data['Subgroup']) + x.bandwidth() * 0.5 ; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + (yInner(d[1]) + yInner(d[0])) / 2 : y(d.data['Group']) + (yInner(d[1]) + yInner(d[0])) / 2; })
  .attr('dy', '0.32em')
  .text(function(d) { return (yInner(d[0]) - yInner(d[1])) > 9 ? Math.round(yInnerInverse(yInner(d[0]) - yInner(d[1]))) : ''; });
  barText.enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) + x.bandwidth() * 0.5 : x(d.data['Subgroup']) + x.bandwidth() * 0.5 ; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + (yInner(d[1]) + yInner(d[0])) / 2 : y(d.data['Group']) + (yInner(d[1]) + yInner(d[0])) / 2; })
  .attr('dy', '0.32em')
  .text(function(d) { return (yInner(d[0]) - yInner(d[1])) > 9 ? Math.round(yInnerInverse(yInner(d[0]) - yInner(d[1]))) : ''; });
  barText.exit().remove();
  // End nested update.
  barTextGroup.enter().append('g')
  .classed('bar-text-group', true)
  .attr('fill', function(d) { return colorText(d.index); })
  .selectAll('text')
  .data(function(d) { return d; })
  .enter().append('text')
  .classed('bar-text', true)
  .attr('x', function(d) { return d3.select('#cluster').property('checked') ? x(d.data['Group']) + x.bandwidth() * 0.5 : x(d.data['Subgroup']) + x.bandwidth() * 0.5 ; })
  .attr('y', function(d) { return d3.select('#cluster').property('checked') ? y(d.data['Subgroup']) + (yInner(d[1]) + yInner(d[0])) / 2 : y(d.data['Group']) + (yInner(d[1]) + yInner(d[0])) / 2; })
  .attr('dy', '0.32em')
  .text(function(d) { return (yInner(d[0]) - yInner(d[1])) > 9 ? Math.round(yInnerInverse(yInner(d[0]) - yInner(d[1]))) : ''; });
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
 updateChartHorizontal(data);
});


// Draw button listener.
d3.select('#draw').on('click', function() {
 d3.event.preventDefault();
 if(d3.select('textarea').node().value) {
  if(d3.select('#vertical-bars').property('checked')) {
   updateChartVertical(parseInput());
  } else {
   updateChartHorizontal(parseInput());
  }
 } else {
  d3.csv('data/sample.csv', function(d, i, columns) {
   for(i = 2, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
   for(i = 2; i < columns.length; ++i) d[columns[i]] = d[columns[i]] / t;
   return d;
  }, function(data) {
   if(d3.select('#vertical-bars').property('checked')) {
    updateChartVertical(data);
   } else {
    updateChartHorizontal(data);
   }
  });
 }
});


// Save button listener.
d3.select('#save').on('click', function() {
 d3.event.preventDefault();
 var e = document.createElement('script');
 e.setAttribute('src', 'https://nytimes.github.io/svg-crowbar/svg-crowbar.js');
 e.setAttribute('class', 'svg-crowbar');
 document.body.appendChild(e);
});