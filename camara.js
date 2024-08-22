// Esse arquivo será responsável por controlar a chart com os dados
// das câmaras municipais.

function drawSankey(error, vereadores) {
  // dados dos vereadores eleitos do RJ de 2004 a 2016
  // window.vereadores = vereadores;
  // AINDA NÃO FUNCIONA!
  // TODO: Consertar essa coisa.
  // window.geraGrafo = function (d, anos, id) {

  //   var graph = {
  //     "nodes": [],
  //     "links": []
  //   };
  //   if (anos.length > 1) {
  //     for (var k = 0; k < anos.length - 1; k++) {
  //       for (var i in d[anos[k]][id].SIGLAS) {
  //         graph.nodes.push({
  //           "name": d[anos[k]] + "_" + d[anos[k]][id].SIGLAS[i].ORIENTACAO
  //         });
  //         graph.nodes.push({
  //           "name": d[anos[k + 1]] + "_" + d[anos[k + 1]][id].SIGLAS[i].ORIENTACAO
  //         }); +
  //         graph.links.push({
  //           "source": ENUM_ORIENTACAO[d[anos[k]][id].SIGLAS[i].ORIENTACAO],
  //           "target": ENUM_ORIENTACAO[d[anos[k + 1]][id].SIGLAS[i].ORIENTACAO],
  //           "value": d[anos[k]][id].SIGLAS[i].CONT
  //         });
  //         // console.log(d[ano][id].SIGLAS);
  //       }
  //     }
  //   } else {
  //     console.log("ERRO: O parametro anos deve ter no minimo 2 elementos.");
  //     return undefined;
  //   }
  //   return graph;
  // };

  const UPLOAD_FILENAME = "camara-rj.csv";
  const CHART_TITLE = "Câmara Municipal do Rio";
  const units = "Cadeiras";
  const margin = {
      top: 20,
      right: 10,
      bottom: 50,
      left: 10
    },
    chartWidth = 850,
    chartHeight = 600;
  
  const sankey_nodes = [100, 55];
  const sankey_links = [100, 55];
  const title_position = [350, 25];

  const initial_layout = [
    [0.37240350, 0.28953409, 0.19519519, 0.25625785],
    [0.28953409, 0.93759677, 0.28310975, 0.27197281],
    [0.19519519, 0.28310975, 0.09549743, 0.25497147],
    [0.25625785, 0.27197281, 0.25497147, 4.79375751]
  ];

  function format(d) {
    // zero decimal places
    return d3.format(",.0f")(d) + " " + units;
  }

  function translate(x, y) { return `translate(${x}, ${y})` };

  const color = d3.scale
    .linear()
    .domain([1, 6])
    .interpolate(d3.interpolateRgb)
    .range(["red", "blue"]);

  // Inicializa o elemento SVG da chart
  const svg = d3
    .select("#sankeyChart")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .append("g");
  // Coloca o título na chart
  svg.append("text")
    .text(CHART_TITLE)
    .attr("class", "chartTitle2")
    .attr("transform", translate(...title_position));

  // Set the sankey diagram properties
  var sankey = d3.sankey(chartWidth, chartHeight - 100)
    .nodeWidth(50)
    .nodePadding(30)
    .size([chartWidth, chartHeight - 100]);

  var path = sankey.link();

  // load the data (using the timelyportfolio csv method)
  d3.csv(UPLOAD_FILENAME, function (error, data) {

    //set up graph in same style as original example but empty
    graph = {
      "nodes": [],
      "links": []
    };

    data.forEach(function (d) {
      graph.nodes.push({
        "name": d.source
      });
      graph.nodes.push({
        "name": d.target
      });
      graph.links.push({
        "source": d.source,
        "target": d.target,
        "value": parseInt(d.value)
      });
      console.log({
        "source": d.source,
        "target": d.target,
        "value": parseInt(d.value)
      });
    });

    // return only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest().key(d => d.name).map(graph.nodes));

    // loop through each link replacing the text with its index from node
    graph.links.forEach(d => {
      d.source = graph.nodes.indexOf(d.source);
      d.target = graph.nodes.indexOf(d.target);
    });

    //now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach((d, i) => {
      graph.nodes[i] = {"name": d};
    });

    sankey
      .nodes(graph.nodes)
      .links(graph.links)
      .layout(initial_layout);

    // add in the links
    var link = svg.append("g")
      .attr("transform", translate(...sankey_links))
      .selectAll(".link")
      .data(graph.links)
      .enter().append("path")
      .attr("class", d => `link ${!d.value ? 'zero' : ''}`)
      .attr("d", path)
      .style("stroke-width", function (d) {
        return Math.max(1, d.dy);
      })
      .sort((a, b) => b.dy - a.dy);

    // add the link titles
    link.append("title")
      .text(d => `${d.source.name} ${d.target.name} \n ${d.value}`);
    
    console.log(graph.nodes);
    // add in the nodes
    const node = svg.append("g")
      .attr("transform", translate(...sankey_nodes))
      .selectAll(".node")
      .data(graph.nodes)
      .enter()
      .append("g")
      .attr("class", d => `node ${!d.value ? 'zero' : ''}`)
      .attr("transform", d => translate(d.x, d.y))
      .call(d3.behavior.drag()
        .origin(d => d)
        .on("dragstart", function () {
          this.parentNode.appendChild(this);
        })
        .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
      .attr("height", function (d) {
        return d.dy;
      })
      .attr("width", sankey.nodeWidth())
      .style("fill", d => d.color = color(d.name[6]) )
      .style("stroke", d => d3.rgb(d.color).darker(2) )
      .append("title")
      .text(d => d.name + "\n" + format(d.value) );

    // add in the title for the nodes
    node.append("text")
      .attr("x", -6)
      .attr("y", d => d.dy / 2)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .attr("transform", null)
      .text(d => d.name)
      .filter(d => d.x < chartWidth / 2)
      .attr("x", 6 + sankey.nodeWidth())
      .attr("text-anchor", "start");

    // the function for moving the nodes
    function dragmove(d) {
      
      d.y = Math.max(0, Math.min(chartHeight - d.dy, d3.event.y));
      d3.select(this)
      .attr("transform", 
        translate(d.x, d.y));
      sankey.relayout();
      link.attr("d", path);
    }
  });

};

$().ready(() => {
  // Leitura dos dados dos vereadores
  // d3.queue()
  //   .defer(d3.json, "vereadores1.json")
  //   .await(drawSankey);
    drawSankey({}, {});
});
