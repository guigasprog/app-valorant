/**
 * Baixa a mídia da valorant-api uma vez, redimensiona e grava em public/midia.
 *
 * Por que isto existe: a API serve PNG de 2048×1860 para retratos que a tela
 * mostra com 216px de largura, e PNG de 1024×1024 para ícones desenhados com
 * 17px. A grade de agentes sozinha baixava 19 MB. Nenhum pré-carregamento
 * conserta 19 MB — só muda a hora da espera.
 *
 * Redimensionado e em WebP, o mesmo conjunto cai para cerca de 1 MB.
 *
 * As imagens ficam versionadas, e não geradas no build, porque um build que
 * depende de um serviço de terceiros estar de pé é um build que quebra sozinho
 * num domingo. O preço é rodar isto quando a Riot lançar agente novo — e, até
 * lá, o app cai na URL remota para o que não tiver cópia local.
 *
 *   node scripts/baixar-midia.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const BASE = 'https://valorant-api.com/v1';
const DESTINO = join(import.meta.dirname, '..', 'public', 'midia');

/**
 * Larguras escolhidas pelo maior tamanho que cada imagem ocupa na tela, com
 * folga para telas de densidade dobrada.
 */
const RETRATO = 640; // card da grade e retrato da página do agente
const ICONE = 128; // ícone de habilidade e miniatura do elenco
const SPLASH = 720; // card de mapa
const ARMA = 400; // arte da arma

async function baixar(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} em ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function gravar(url, pasta, nome, largura) {
  if (!url) return { pulou: true, bytes: 0 };

  const original = await baixar(url);
  const reduzida = await sharp(original)
    .resize({ width: largura, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await mkdir(join(DESTINO, pasta), { recursive: true });
  await writeFile(join(DESTINO, pasta, `${nome}.webp`), reduzida);

  return { pulou: false, bytes: reduzida.length, antes: original.length };
}

async function json(caminho) {
  const res = await fetch(`${BASE}${caminho}`);
  const corpo = await res.json();
  return corpo.data;
}

const totais = { antes: 0, depois: 0, arquivos: 0 };

function somar(r) {
  if (r.pulou) return;
  totais.antes += r.antes;
  totais.depois += r.bytes;
  totais.arquivos += 1;
}

console.log('Buscando catálogo…');
const [agentes, mapas, armas] = await Promise.all([
  json('/agents?isPlayableCharacter=true&language=pt-BR'),
  json('/maps?language=pt-BR'),
  json('/weapons?language=pt-BR'),
]);

console.log(`Agentes: ${agentes.length}`);
for (const a of agentes) {
  somar(await gravar(a.bustPortrait ?? a.displayIcon, 'agentes', `${a.uuid}-retrato`, RETRATO));
  somar(await gravar(a.displayIcon, 'agentes', `${a.uuid}-icone`, ICONE));
  somar(await gravar(a.role?.displayIcon, 'funcoes', a.role.uuid, ICONE));
  for (const h of a.abilities) {
    if (!h.displayIcon) continue;
    somar(await gravar(h.displayIcon, 'habilidades', `${a.uuid}-${h.slot}`, ICONE));
  }
  process.stdout.write('.');
}
console.log('');

// Só os mapas que o app mostra — ver `modoDoMapa`. Baixar os outros seria peso
// para telas que não existem.
const jogaveis = mapas.filter((m) => m.tacticalDescription || m.assetPath.includes('/HURM_'));
console.log(`Mapas: ${jogaveis.length}`);
for (const m of jogaveis) {
  somar(await gravar(m.splash, 'mapas', m.uuid, SPLASH));
  // A planta vista de cima. Vai maior que o splash porque é o que se fica
  // olhando de perto na página do mapa, procurando onde fica cada callout.
  somar(await gravar(m.displayIcon, 'minimapas', m.uuid, 900));
  process.stdout.write('.');
}
console.log('');

console.log(`Armas: ${armas.length}`);
for (const w of armas) {
  somar(await gravar(w.displayIcon, 'armas', w.uuid, ARMA));
  process.stdout.write('.');
}
console.log('');

const mb = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;
console.log(`\n${totais.arquivos} arquivos`);
console.log(`antes:  ${mb(totais.antes)}`);
console.log(`depois: ${mb(totais.depois)}`);
console.log(`corte:  ${Math.round((1 - totais.depois / totais.antes) * 100)}%`);
