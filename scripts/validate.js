#!/usr/bin/env node
/**
 * Valida todos los data/bloque-N/test-NN.json del repo.
 * Uso: node scripts/validate.js
 * Sale con código 1 si encuentra cualquier error — no commitear en rojo.
 */
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "public", "data");
const REQUIRED_FIELDS = ["id","bloque","tema","test","dificultad","pregunta","opciones","correcta","explicacion","why","norma","articulo"];
const VALID_DIFFICULTIES = ["facil","media","dificil"];

let errors = [];
let warnings = [];
const seenIds = new Set();
const seenQuestionText = new Map(); // texto normalizado -> id

function normalize(str){
  return str.toLowerCase().replace(/[^a-z0-9áéíóúñ]/gi,"").trim();
}

function validateFile(filePath, relPath){
  let json;
  try{
    json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch(e){
    errors.push(`${relPath}: JSON inválido — ${e.message}`);
    return;
  }
  if(!Array.isArray(json)){
    errors.push(`${relPath}: debe ser un array de preguntas`);
    return;
  }
  if(json.length !== 20){
    warnings.push(`${relPath}: contiene ${json.length} preguntas (se esperan 20 por test)`);
  }

  json.forEach((q, i)=>{
    const loc = `${relPath} [índice ${i}]`;

    REQUIRED_FIELDS.forEach(f=>{
      if(q[f]===undefined || q[f]===null || q[f]==="") errors.push(`${loc}: falta el campo obligatorio "${f}"`);
    });
    if(!q.id) return;

    if(seenIds.has(q.id)) errors.push(`${loc}: id duplicado "${q.id}"`);
    seenIds.add(q.id);

    if(q.dificultad && !VALID_DIFFICULTIES.includes(q.dificultad)){
      errors.push(`${loc}: dificultad "${q.dificultad}" no válida (usar facil/media/dificil)`);
    }

    if(q.opciones){
      const letters = Object.keys(q.opciones);
      const expected = ["A","B","C","D"];
      if(expected.some(l=>!letters.includes(l))){
        errors.push(`${loc}: faltan opciones A/B/C/D`);
      }
      if(!expected.includes(q.correcta)){
        errors.push(`${loc}: "correcta" debe ser A, B, C o D`);
      }
      // detecta respuestas duplicadas dentro de las 4 opciones (posible ambigüedad)
      const values = Object.values(q.opciones).map(v=>normalize(String(v)));
      const uniqueValues = new Set(values);
      if(uniqueValues.size !== values.length){
        errors.push(`${loc}: dos opciones de respuesta son textualmente idénticas — riesgo de ambigüedad`);
      }
    }

    if(q.pregunta){
      const norm = normalize(q.pregunta);
      if(seenQuestionText.has(norm)){
        errors.push(`${loc}: pregunta casi idéntica a ${seenQuestionText.get(norm)} — revisar duplicado de contenido`);
      }
      seenQuestionText.set(norm, q.id);
    }

    // bloque/tema/test consistency con la ruta del fichero
    const match = relPath.match(/bloque-(\d+)[\\/]test-(\d+)\.json/);
    if(match){
      const [, bloqueFromPath, testFromPath] = match.map(Number);
      if(q.bloque !== bloqueFromPath) errors.push(`${loc}: campo "bloque" (${q.bloque}) no coincide con la carpeta (${bloqueFromPath})`);
      if(q.test !== testFromPath) errors.push(`${loc}: campo "test" (${q.test}) no coincide con el nombre de fichero (${testFromPath})`);
    }
  });
}

function walk(dir){
  for(const entry of fs.readdirSync(dir, {withFileTypes:true})){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) walk(full);
    else if(entry.name.match(/^test-\d+\.json$/)) validateFile(full, path.relative(path.join(__dirname,".."), full));
  }
}

if(!fs.existsSync(DATA_DIR)){
  console.error(`No existe ${DATA_DIR}`);
  process.exit(1);
}
walk(DATA_DIR);

if(warnings.length){
  console.log(`\n${warnings.length} avisos:`);
  warnings.forEach(w=>console.log("  - "+w));
}

if(errors.length){
  console.log(`\n${errors.length} ERRORES — no commitear:`);
  errors.forEach(e=>console.log("  ✗ "+e));
  process.exit(1);
} else {
  console.log(`\nOK — ${seenIds.size} preguntas validadas sin errores.`);
  process.exit(0);
}
