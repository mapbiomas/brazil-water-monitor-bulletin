# Boletim do Monitor da Água — MapBiomas Água

**Página:** https://pedrogalve00.github.io/boletim-monitor-agua/

Página única (`index.html`), no mesmo modelo do boletim do Monitor do Fogo: não tem build nem servidor.
Ao abrir, ela baixa as planilhas mensais v3 e os contornos (série considerada **a partir de 2019**, `ANO_INICIO` no código), acha sozinha o último mês com dados, faz as
contas no navegador e monta o boletim em slides 16:9, no visual do factsheet do MapBiomas Água
(Montserrat, logo no cabeçalho, número da página, barra azul). **Exportar PDF** usa a impressão do navegador.


## Estrutura

```
index.html                          página do boletim
img/logo_mapbiomas_agua.png         logo do cabeçalho (troque pelo arquivo oficial, se quiser)
dados/                              estatísticas mensais do Monitor (trocar todo mês)
  stats_bioma_v3.csv
  stats_estado_v3.csv
  stats_bacia_n1_v3.csv            bacias hidrográficas nível 1 (DHN250 nível 1)
  stats_bacia_n2_v3.csv            bacias hidrográficas nível 2 (DHN250 nível 2)
geo/                                contornos simplificados (gerar uma vez)
  bioma.geojson  estado.geojson  bacia_n1.geojson  bacia_n2.geojson
gee/exportar_contornos_boletim.js   script do Earth Engine que exporta os contornos
```

## Uma vez: gerar os contornos

Os contornos vêm dos **mesmos assets usados nas estatísticas** do Monitor:

| Arquivo | Asset | Código / nome |
|---|---|---|
| `bioma.geojson` | `projects/mapbiomas-territories/assets/TERRITORIES/BRAZIL/WORKSPACE/BIOMES/BIOMES_v4` | `FEATURE_ID` / `NAME` |
| `estado.geojson` | `projects/mapbiomas-territories/assets/PLATFORM/demo/mapbiomas/brazil/territories/ESTADOS_IBGE_2025_F7EAF953/3f95fd9d-4b26-4243-8612-37b9d5b12a55` | `FEATURE_ID` / `NM_UF` |
| `bacia_n1.geojson` | `projects/mapbiomas-territories/assets/TERRITORIES-STAGING/BRAZIL/WORKSPACE/DHN250_LEVEL_1/DHN250_LEVEL_1_v2` | `FEATURE_ID` / `NAME` |
| `bacia_n2.geojson` | `projects/mapbiomas-territories/assets/TERRITORIES-STAGING/BRAZIL/WORKSPACE/DHN250_LEVEL_2/DHN250_LEVEL_2_v3` | `FEATURE_ID` / `NAME` |

1. Rode `gee/exportar_contornos_boletim.js` no Code Editor e as 4 tarefas (Drive → `boletim_contornos`).
2. Limpe os arquivos (só polígonos, simplificação 0,005°, 4 casas decimais) e confira se `code` e `name` batem com as planilhas.
3. Coloque os 4 arquivos em `geo/`.

## Todo mês

1. Substitua os 4 CSVs `stats_*_v3.csv` em `dados/` (mesmos nomes; colunas `nivel, feature_id, nome, ano, mes, ha_agua_obs, ha_agua_est, ha_agua, n_cartas` — a página usa `ha_agua`, ignora `feature_id` 0 "sem feição" e tira os colchetes dos nomes), **só com os anos de 2019 em diante** — a página ignora anos anteriores, mas o que está no repositório fica público.
2. Publique (commit no repositório com GitHub Pages ligado).
3. Abra a página → **Exportar PDF**.

> Se o último mês da planilha só repetir o mês anterior (ex.: dezembro = novembro na maioria dos biomas), a página abre no mês anterior e mostra um aviso no topo. O mês repetido continua disponível no seletor.

## Slides

| | Conteúdo |
|---|---|
| 1 | Capa |
| 2 | Brasil (soma dos biomas): água do mês, triângulos vs média do mês, vs mês anterior e vs ano anterior, linhas mensais por ano (ano do boletim em azul-escuro, média em laranja), série do mês ao longo dos anos, posição no histórico |
| 3 | Biomas: mapa do desvio, ranking da variação absoluta, anel com % abaixo da média, caixas do maior ganho e da maior perda (com posição no mês e no ranking histórico) |
| 4 | Superfície de água mensal nos 6 biomas + destaques automáticos |
| 5 | UFs: mapa com siglas, ranking das 27 UFs, anel e caixas |
| 6 | Bacias hidrográficas nível 1 (DHN250): mapa, ranking de ganhos e perdas, anel e caixas |
| 7 | Bacias hidrográficas nível 2 (DHN250): mapa, 10 maiores ganhos e 10 maiores perdas, anel e caixas |
| 8 | Ranking histórico do Brasil: posição do mês entre todos os meses da série e os 20 meses de maior perda e de maior ganho |

Nos slides de Biomas, UFs e Bacias hidrográficas nível 1 e 2, as caixas da direita destacam o **maior ganho e a maior perda absolutos (ha)** e o maior aumento/redução em relação ao mês anterior; ao lado do mapa ficam os destaques **relativos (%)**. Há também uma mensagem sob o mapa (onde estão as maiores perdas e ganhos) e sob o gráfico (quantos ficaram acima/abaixo da média, saldo e comparação com o mês anterior); as caixas de destaque também mostram a variação em relação ao mês anterior.

Cada gráfico e mapa tem botões **PNG** (fundo transparente, 4× a tela) e **CSV**. **Baixar dados (CSV)** traz
todos os territórios. As contas são as mesmas do Colab `boletim_agua_mensal.ipynb`.

## Endereços úteis

- `index.html?mes=2025-06` → um mês específico (também no seletor do topo)
- `index.html?dados=https://.../&geo=https://.../` → ler de outras pastas públicas

## Formato das planilhas e contornos

- O `code` de cada contorno é o `FEATURE_ID` do asset, igual ao `feature_id` das planilhas (nos estados não é o código IBGE).
- O mapa liga contorno e planilha pelo nome e, se não achar, pelo código.
- No asset de estados o Rio Grande do Sul tem `FEATURE_ID` 0, e a planilha o chama de "sem feição"; a página o renomeia para Rio Grande do Sul.
  Nas planilhas de bacias, "sem feição" (água fora dos polígonos do DHN250, ~1,8 Mha, quase constante) continua de fora.
- Nomes com acento quebrado na planilha (ex.: `Amap\ufffd`) são corrigidos pelo nome do contorno.
