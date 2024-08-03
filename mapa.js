// Script de construção da chart do RJ
// by Glauco Azevedo - FGV/EMAp - Dez/2016
// Curso de Visualização de Informação - profa.: Asla Sá
// const width = 700;
// const height = 500;
var dimensions = {
    width: 700,
    height: 500,
};

function listarAnos(anoInicial, numPeriodos) {
    let anos = [];
    for(let i = 0; i < numPeriodos; i++) {
        anos.push(anoInicial);
        anoInicial += 4;
    }
    return anos;
}

var anoInicial = 2004;
var listaAnos = listarAnos(anoInicial, 4);
const ENUM_ORIENTACAO = {
    1: "extrema-esquerda",
    2: "esquerda",
    3: "centro-esquerda",
    4: "centro",
    5: "centro-direita",
    6: "direita",
    7: "extrema-direita"
};
window.ENUM_ORIENTACAO = ENUM_ORIENTACAO;

let setAno = function(_) {
        if( _ == '+' && anoInicial < listaAnos[listaAnos.length-1] ){
            anoInicial += 4;
            $("#ano-atual").text(anoInicial);
            $(".chartTitle").text("Prefeituras "+anoInicial);
        }
        else if( _ == '-' && anoInicial > listaAnos[0]) {
            anoInicial -= 4;
            $("#ano-atual").text(anoInicial);
            $(".chartTitle").text("Prefeituras "+anoInicial);
        }
        else {
            console.log('ERRO: Opção Inválida!');
            return undefined;
        }
        console.log('Redesenhar!');
        redraw();

};
// M�todo para redesenhar a chart(na prática, só trocar as cores e valores de
// atributos);
let redraw = function() {
    d3.select("#mainChart")
      .selectAll("path")
      .transition().delay(100)
      .style("fill",function(d){
        let id = d.properties.id;
        if(prefeitos[anoInicial][id])
            return color(prefeitos[anoInicial][id].ORIENTACAO);
      });
}

let color = d3.scale.linear()
              .domain([1,6])
              .interpolate(d3.interpolateRgb)
              .range(["red", "blue"]);
// Metodo para construir a chart do estado, com os parâmetros setados no momento.
let drawChart = function(svg,path,states) {
    // console.log(ano);
    svg.append("text")
        .text("Prefeituras "+anoInicial)
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
            if(prefeitos[anoInicial][d.properties.id])
                return color(prefeitos[anoInicial][d.properties.id].ORIENTACAO);
        });

        let div = d3.select("body")
                    .append("div")
                    .attr("class", "infobox")
                    .style("opacity", 0);

        d3.selectAll("path")
        .on("mouseover", function(d) {
            const cidade = d.properties;
            const msg = [
                cidade.nome, 
                prefeitos[anoInicial][cidade.id].SIGLA,
                ENUM_ORIENTACAO[prefeitos[anoInicial][cidade.id].ORIENTACAO]
            ].join("<br/>");

            div.transition()
                .duration(300)
                .style("opacity", .9);

            div.html(msg)
                .style({
                    "left": `${d3.event.pageX}px`,
                    "top":  `${(d3.event.pageY - 28)}px`,
                    "padding": "10px"
                });
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(400)
                .style("opacity", 0);
        })
        .on("click",function(d){
            // Chamada do metodo que desenha o Sankey Chart de vereadores.
            console.log(`Cidade: ${d.properties.nome}`);
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

        $("#ano-atual").text(anoInicial);

        d3.queue()
            .defer(d3.json,"prefeitos1.json")//Leitura dos dados dos prefeitos eleitos
            .defer(d3.json,"rj-cidades.json")// Leitura dos dados geograficos dos municípios do RJ
            .awaitAll(ready);

        //Método que inicializa a chart e desenha
        function ready(error, dados) {
            if(error) return console.error(error);
            else{
                    window.prefeitos = dados[0];
                    window.br_states = dados[1];
                    const svg = d3.select("#mainChart")
                            .attr("width", dimensions.width)
                            .attr("height", dimensions.height);

                    const projection = d3.geo.mercator()
                                        .center([-42,-22])
                                        .scale(9500);

                    const path = d3.geo.path()
                                 .projection(projection);

                    const states = topojson.feature(br_states, br_states.objects.states);
                    drawChart(svg,path,states);
                }
        };
});
