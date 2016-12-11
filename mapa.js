// Script de constru��o da chart

window.AnoInicial = 2016;
window.listaAnos = [2004,2008,2012,2016];

// A melhor forma de conseguir o efeito que desejo � setar as cores
// do meu jeito com as 7 categorias e abandonar o m�todo acima.
// var color = function(obj){
//
//         if(obj.ORIENTACAO == 1) return rgb(255, 0, 0);
//         if(obj.ORIENTACAO == 2) return rgb(255, , 0);
//         if(obj.ORIENTACAO == 3) return rgb(255, 0, 0);
//         if(obj.ORIENTACAO == 4) return rgb(255, 0, 0);
//         if(obj.ORIENTACAO == 5) return rgb(255, 0, 0);
//         if(obj.ORIENTACAO == 6) return rgb(255, 0, 0);
//         if(obj.ORIENTACAO == 7) return rgb(255, 0, 0);
// };
// var color = d3.scale.sqrt().domain([1,7]).range(['red','blue']);
var color = d3.scale.linear()
              .domain([1,7])
              .interpolate(d3.interpolateRgb)
              .range(["white", "black"])
// Metodo para construir a chart do estado, com os par�metros setados no momento.
var drawChart = function(svg,path,states,ano) {
    console.log(ano);
    svg.append("text")
        .text("Elei��es "+ano)
        .attr("class","chartTitle")
        .attr("transform","translate(250,30)");
    svg.append("g")
        .attr("class","rj-state")
        .selectAll("path")
        .data(states.features)
        .enter()
        .append("path")
        .attr("d",path)
        .attr("class","cities")
        .attr("nome",function(d){return d.properties.nome;})
        .transition().delay(0)
        .attr("sigla",function (d){return d.properties.sigla;})
        .style("fill",function(d){
            if(prefeitos[ano][d.properties.id])
                return color(prefeitos[ano][d.properties.id].ORIENTACAO);
        });

        d3.selectAll("path")
        .on("mouseover",function(){
        d3.select(this.nextSibling)
            .append("rect")
            .attr("class","infobox")
            .attr("opacity", "0.8")
        })
        .on("mouseout",function(){
            d3.select(this)
                .attr("opacity", "0")
        });

}

// var color = d3.scale.sqrt().domain([4,25]).range(['red','blue']);
// Parte principal do script
$(document).ready(function(){

        var width = 700, height = 500,
            svg = d3.select("#mainChart")
                    .attr("width",width)
                    .attr("height",height)
                    .style("border","1px solid gray");

        d3.queue()
            .defer(d3.json,"prefeitos1.json")//Leitura dos dados dos prefeitos eleitos
            .defer(d3.json,"rj-cidades.json")// Leitura dos dados geogr�ficos dos munic�pios do RJ
            .awaitAll(ready);

        //M�todo que inicializa a chart e desenha
        function ready(error,dados) {
            if(error) return console.error(error);
            else{
                    window.prefeitos = dados[0];//Devido ao paralelismo do carregamento, o arquivo de prefeitos carrega mais r�pido e chega primeiro ao browser por ser menor;
                    window.br_states = dados[1];//Consequentemente, os dados de fronteira dos Munic�pios chegam logo em seguida.

                    var projection = d3.geo.mercator()
                                        .center([-42,-22])
                                        .scale(9500);

                    // var color = d3.scale.sqrt().domain([1,7]).range(['red','blue']);
                    var path = d3.geo.path()
                                 .projection(projection);

                    var states = topojson.feature(br_states,br_states.objects.states);

                    drawChart(svg,path,states,AnoInicial);
                }
        };

        // function addMouseEvents(){
        //     d3.selectAll("path")
        //       .append()
        // }

        // Colocar os efeitos de hovering e informa��oes de sele��o, como o nome
        // do Munic�pio e dar um highlight no contorno do Município.
        // Executar o sankey chart ao clicar no munic��pio selecionado.
        // Colocar o timelapse com os anos e slider(#timescroll) com uma estilização
        // deve permitir um ajuste fino do que se vê.


        // var zoom = d3.behavior.zoom()
        //             .scaleExtent(scaleExtent)
        //             .scale(projection.scale())
        //             .translate([0,0])               // not linked directly to projection
        //             .on("zoom", redraw);
        //
        //             svg.selectAll('path')
        //             .data(topojson.feature(world, world.objects.countries).features)
        //           .enter().append('path')

});
