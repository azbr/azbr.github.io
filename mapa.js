// Script de construção da chart
$(document).ready(function(){

        var width = 700, height = 500,
            svg = d3.select("#mainChart")
                    .attr("width",width)
                    .attr("height",height)
                    .style("border","1px solid gray");

        d3.queue()
            .defer(d3.json,"rj-cidades.json")
            .await(ready);

        function ready(error,br_states) {
            if(error) return console.error(error);

            var projection = d3.geo.mercator()
                                .center([-42,-22])
                                .scale(9500);

            var color = d3.scale.sqrt().domain([4,25]).range(['red','blue']);
            // A melhor forma de conseguir o efeito que desejo é setar as cores
            // do meu jeito com as 7 categorias e abandonar o método acima.

            var path = d3.geo.path()
                         .projection(projection);

            var states = topojson.feature(br_states,br_states.objects.states);
            console.log(states);
            svg.append("g")
                .attr("class","rj-state")
                .selectAll("path")
                .data(states.features)
                .enter()
                .append("path")
                .attr("d",path)
                .attr("class","cities")
                .transition().delay(0)
                .style("fill",function(d){
                    return color(+d.properties.nome.length);
                });
        };

        // Colocar os efeitos de hovering e informações de seleção, como o nome
        // do Município e dar um highlight no contorno do Município.
        // Executar o sankey chart ao clicar no município selecionado.
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
