// Esse arquivo será responsável por controlar a chart com os dados
// das câmaras municipais.
$().ready(function(){

    // Leitura dos dados dos vereadores
    d3.queue()
      .defer(d3.json,"vereadores.json")
      .await(ready3);

    function ready3(error,vereadores) {
        window.vereadores = vereadores;
        // console.log(vereadores);
    }

    // Construir a nova chart

});
