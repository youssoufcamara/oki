$(function () {
  var selectedCriteria = "lum";
  var jsonData, selectedData;
  $("#criteria").change(function() {
    selectedCriteria = $("#criteria").val()
    selectedData = jsonData[selectedCriteria];
    $("svg").remove();
    renderChart(selectedCriteria, selectedData);
  });


  $.getJSON("data.json", function(data, status) {
    jsonData = data;
    selectedData = data[selectedCriteria];
    renderChart(selectedCriteria, selectedData);
  });
});

function renderChart(selectedCriteria, selectedData) {
  var margin = {top: 80, right: 80, bottom: 80, left: 80},
      width = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1);

  /**
   * Scale of the two axes.
   * y0 = number
   * y1 = average of gravity
   */
  var y0 = d3.scale.linear().domain([0, 100000]).range([height, 0]),
  y1 = d3.scale.linear().domain([0, 40]).range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  // create left yAxis
  var yAxisLeft = d3.svg.axis().scale(y0).ticks(4).orient("left");
  // create right yAxis
  var yAxisRight = d3.svg.axis().scale(y1).ticks(6).orient("right");

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("class", "graph")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x.domain(selectedData.map(function(d) { return fromValue(selectedCriteria, d.title); }));
    y0.domain([0, d3.max(selectedData, function(d) { return d.nb; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll(".tick text")
        .call(wrap, x.rangeBand());

    svg.append("g")
      .attr("class", "y axis axisLeft")
      .attr("transform", "translate(0,0)")
      .call(yAxisLeft)
    .append("text")
      .attr("y", 6)
      .attr("dy", "-2em")
      .style("text-anchor", "end")
      .style("text-anchor", "end")
      .text("Accidents");

    svg.append("g")
      .attr("class", "y axis axisRight")
      .attr("transform", "translate(" + (width) + ",0)")
      .call(yAxisRight)
    .append("text")
      .attr("y", 6)
      .attr("dy", "-2em")
      .attr("dx", "2em")
      .style("text-anchor", "end")
      .text("Gravité moyenne");

    bars = svg.selectAll(".bar").data(selectedData).enter();

    bars.append("rect")
        .attr("class", "bar1")
        .attr("x", function(d) { return x(fromValue(selectedCriteria, d.title)); })
        .attr("width", x.rangeBand()/2)
        .attr("y", function(d) { return y0(d.nb); })
      .attr("height", function(d,i,j) { return height - y0(d.nb); });

    bars.append("rect")
        .attr("class", "bar2")
        .attr("x", function(d) { return x(fromValue(selectedCriteria, d.title)) + x.rangeBand()/2; })
        .attr("width", x.rangeBand() / 2)
        .attr("y", function(d) { return y1(d.avg); })
      .attr("height", function(d,i,j) { return height - y1(d.avg); });


    function wrap(text, width) {
      text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
          }
        }
      });
    }
}


function fromValue(criteria, value) {
  var mapping = {
    lum: {
      "1": "Plein jour",
      "2": "Crépuscule ou aube",
      "3": "Nuit sans éclairage public",
      "4": "Nuit avec éclairage public non allumé",
      "5": "Nuit avec éclairage public allumé"
    },
    agg: {
      "1": "Hors agglo",
      "2": "Agglo de moins de 2 000 habitants",
      "3": "Agglo entre 2000 habitants et 5000 habitants",
      "4": "Agglo entre 5000 habitants et 10000 habitants",
      "5": "Agglo entre 10000 habitants et 20000 habitants",
      "6": "Agglo entre 20000 habitants et 50000 habitants",
      "7": "Agglo entre 50000 habitants et 100000 habitants",
      "8": "Agglo entre 100000 habitants et 300000 habitants",
      "9": "Agglo de plus de 300000 habitants"
    },
    "int": {
      "0": "Non renseigné",
      "1": "Hors intersection",
      "2": "Intersect. en X",
      "3": "Intersect. en T",
      "4": "Intersect. en Y",
      "5": "Intersect. à plus de 4 branches",
      "6": "Giratoire",
      "7": "Place",
      "8": "Passage à niveau",
      "9": "Autre intersection"
    },
    atm: {
      "0": "Non renseigné",
      "1": "Normale",
      "2": "Pluie légère",
      "3": "Pluie forte",
      "4": "Neige - grêle",
      "5": "Brouillard - fumée",
      "6": "Vent fort - tempête",
      "7": "Temps éblouissant",
      "8": "Temps couvert",
      "9": "Autre"
    },
    col: {
      "0": "Non renseigné",
      "1": "Deux véhicules - frontale",
      "2": "Deux véhicules – par l’arrière",
      "3": "Deux véhicules – par le coté",
      "4": "Trois véhicules et plus – en chaîne",
      "5": "Trois véhicules et plus  - collisions multiples",
      "6": "Autre collision",
      "7": "Sans collision"
    },
    catr: {
      "0": "Non renseigné",
      "1": "Autoroute",
      "2": "Route Nationale",
      "3": "Route Départementale",
      "4": "Voie Communale",
      "5": "Hors réseau public",
      "6": "Parc de stationnement ouvert à la circulation publique",
      "9": "autre"
    }
  };

  return mapping[criteria][value];
}
