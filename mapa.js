// Script de construção da chart do RJ
// by Glauco Azevedo - FGV/EMAp - Dez/2016
// Curso de Visualização de Informação - profa.: Asla Sá
var width = 700, height = 500;
window.AnoAtual = 2004;
window.listaAnos = [2004,2008,2012,2016];
window.descr = {1:"extrema-esquerda",
                2:"esquerda",
                3:"centro-esquerda",
                4:"centro",
                5:"centro-direita",
                6:"direita",
                7:"extrema-direita"};

var setAno = function(_) {
        if( _ == '+' && window.AnoAtual < listaAnos[listaAnos.length-1] ){
            window.AnoAtual += 4;
            $("#ano-atual").text(window.AnoAtual);
            $(".chartTitle").text("Prefeituras "+window.AnoAtual);
        }
        else if( _ == '-' && window.AnoAtual > listaAnos[0]) {
            window.AnoAtual -= 4;
            $("#ano-atual").text(window.AnoAtual);
            $(".chartTitle").text("Prefeituras "+window.AnoAtual);
        }
        else {
            console.log('ERRO: Opção Inválida!');
            return undefined;
        }
        console.log('Redesenhar!');
        redraw();

};
// Método para redesenhar a chart(na prática, só trocar as cores e valores de
// atributos);
var redraw = function() {
    d3.select("#mainChart")
      .selectAll("path")
      .transition().delay(100)
      .style("fill",function(d){
          if(window.prefeitos[window.AnoAtual][d.properties.id])
              return color(window.prefeitos[window.AnoAtual][d.properties.id].ORIENTACAO);
      });
}

var color = d3.scale.linear()
              .domain([1,6])
              .interpolate(d3.interpolateRgb)
              .range(["red", "blue"]);
// Metodo para construir a chart do estado, com os parâmetros setados no momento.
var drawChart = function(svg,path,states) {
    // console.log(ano);
    svg.append("text")
        .text("Prefeituras "+window.AnoAtual)
        .attr("class","chartTitle")
        .attr("transform","translate(220,30)");
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
            if(window.prefeitos[window.AnoAtual][d.properties.id])
                return color(window.prefeitos[window.AnoAtual][d.properties.id].ORIENTACAO);
        });

        var div = d3.select("body").append("div")
                    .attr("class", "infobox")
                    .style("opacity", 0);

        d3.selectAll("path")
        .on("mouseover", function(d) {
            // d.select().style("stroke","yellow");
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.properties.nome+"</br>"+
                     window.prefeitos[window.AnoAtual][d.properties.id].SIGLA+"</br>"+
                     descr[window.prefeitos[window.AnoAtual][d.properties.id].ORIENTACAO])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            // d.select().style("stroke","white");
            div.transition()
                .duration(400)
                .style("opacity", 0);
        })
        .on("click",function(d){
            // Chamada do metodo que desenhará o Sankey Chart de vereadores.
            console.log("Cidade:"+d.properties.nome);
        });
};
// Parte principal do script
$(document).ready(function(){

        // Adicionando Listeners para alguns dos botões da página.
        $("#previous").on("click",function() {
            setAno('-');
        });
        $("#next").on("click",function() {
            setAno('+');
        });

        $("#ano-atual").text(AnoAtual);

        d3.queue()
            .defer(d3.json,"prefeitos1.json")//Leitura dos dados dos prefeitos eleitos
            .defer(d3.json,"rj-cidades.json")// Leitura dos dados geograficos dos municípios do RJ
            .awaitAll(ready);

        //Mï¿½todo que inicializa a chart e desenha
        function ready(error,dados) {
            if(error) return console.error(error);
            else{
                    window.prefeitos = dados[0];//Devido ao paralelismo do carregamento, o arquivo de prefeitos carrega mais rï¿½pido e chega primeiro ao browser por ser menor;
                    window.br_states = dados[1];//Consequentemente, os dados de fronteira dos Municï¿½pios chegam logo em seguida.
                    var svg = d3.select("#mainChart")
                            .attr("width",width)
                            .attr("height",height);

                    var projection = d3.geo.mercator()
                                        .center([-42,-22])
                                        .scale(9500);

                    var path = d3.geo.path()
                                 .projection(projection);

                    var states = topojson.feature(br_states,br_states.objects.states);
                    drawChart(svg,path,states);
                }
        };
});
