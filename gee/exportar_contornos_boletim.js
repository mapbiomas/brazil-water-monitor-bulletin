// ============================================================
// MapBiomas Água — CONTORNOS DO BOLETIM (mesmos assets das estatísticas)
// ============================================================
// Exporta 4 GeoJSON para o Drive (pasta boletim_contornos):
//   bioma.geojson    -> BIOMES_v4
//   estado.geojson   -> ESTADOS_IBGE_2025 (RS tem FEATURE_ID 0)
//   bacia_n1.geojson -> DHN250 nível 1  (planilha stats_bacia_n1_v3)
//   bacia_n2.geojson -> DHN250 nível 2  (planilha stats_bacia_n2_v3)
// Cada feição sai só com 'code' (= FEATURE_ID = feature_id das
// planilhas) e 'name'. Depois de baixar, os arquivos são limpos
// (só polígonos, simplificados) antes de ir para geo/.
// ============================================================

var NIVEIS = [
  {arq: 'bioma',    code: 'FEATURE_ID', nome: 'NAME',
   asset: 'projects/mapbiomas-territories/assets/TERRITORIES/BRAZIL/WORKSPACE/BIOMES/BIOMES_v4'},
  {arq: 'estado',   code: 'FEATURE_ID', nome: 'NM_UF',
   asset: 'projects/mapbiomas-territories/assets/PLATFORM/demo/mapbiomas/brazil/territories/ESTADOS_IBGE_2025_F7EAF953/3f95fd9d-4b26-4243-8612-37b9d5b12a55'},
  {arq: 'bacia_n1', code: 'FEATURE_ID', nome: 'NAME',
   asset: 'projects/mapbiomas-territories/assets/TERRITORIES-STAGING/BRAZIL/WORKSPACE/DHN250_LEVEL_1/DHN250_LEVEL_1_v2'},
  {arq: 'bacia_n2', code: 'FEATURE_ID', nome: 'NAME',
   asset: 'projects/mapbiomas-territories/assets/TERRITORIES-STAGING/BRAZIL/WORKSPACE/DHN250_LEVEL_2/DHN250_LEVEL_2_v3'}
];

var SIMPLIFICA_M = 500;
var PASTA_DRIVE  = 'boletim_contornos';

function codigoTexto(v) {
  var n = ee.Algorithms.If(
    ee.String(ee.Algorithms.ObjectType(v)).equals('String'),
    ee.Number.parse(v), v);
  return ee.Number(n).int().format();
}

function preparar(fc, nv) {
  return fc.map(function (f) {
    return ee.Feature(f.geometry().simplify(SIMPLIFICA_M), {
      code: codigoTexto(f.get(nv.code)),
      name: f.get(nv.nome)
    });
  });
}

NIVEIS.forEach(function (nv) {
  var fc = ee.FeatureCollection(nv.asset);
  var saida = preparar(fc, nv);
  print('=== ' + nv.arq + ' (' + nv.code + ', ' + nv.nome + ') ===');
  print('  nº de feições:', fc.size());
  print('  code -> nome:', saida.map(function (f) {
    return ee.Feature(null, {code: f.get('code'), name: f.get('name')});
  }).sort('name').reduceColumns(ee.Reducer.toList(2), ['code', 'name']).get('list'));
  Map.addLayer(ee.Image().byte().paint(fc, 0, 1), {palette: ['ffffff']}, nv.arq, false);
  Export.table.toDrive({
    collection: saida,
    description: 'contorno_' + nv.arq,
    folder: PASTA_DRIVE,
    fileNamePrefix: nv.arq,
    fileFormat: 'GeoJSON',
    selectors: ['code', 'name', '.geo']   // sem '.geo' a geometria sai nula
  });
});

Map.setOptions('SATELLITE');
Map.setCenter(-52, -14, 4);
