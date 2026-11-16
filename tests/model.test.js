const {test}=require('node:test');
const assert=require('node:assert/strict');
const {parseCSV,normalize,lane}=require('../model.js');
test('CSV con BOM, comillas escapadas, comas y saltos de línea',()=>{
  const rows=parseCSV('\uFEFFIssue key,Summary,Issue Type,Status,Description\r\nSCRUM-1,"Texto, ""citado""",Story,Idea,"Línea 1\nLínea 2"');
  assert.equal(rows[0].Summary,'Texto, "citado"');
  assert.equal(rows[0].Description,'Línea 1\nLínea 2');
});
test('resuelve épica a través del padre y conserva ausencia de prioridad',()=>{
  const rows=[
    {'Issue key':'SCRUM-1',Summary:'Épica','Issue Type':'Epic',Status:'Idea'},
    {'Issue key':'SCRUM-2',Summary:'Historia','Issue Type':'Story',Status:'Idea','Parent key':'SCRUM-1'},
    {'Issue key':'SCRUM-3',Summary:'Subtarea','Issue Type':'Subtask',Status:'Idea','Parent key':'SCRUM-2'}
  ];
  const issues=normalize(rows);
  assert.equal(issues[2].epic,'SCRUM-1');
  assert.equal(issues[1].moscow,'NONE');
  assert.equal(lane(issues[1]),'Backlog futuro');
  assert.equal(lane({...issues[1],status:'Finalizado'}),'Sin sprint · finalizado');
});
test('rechaza archivos incompatibles o incompletos',()=>{
  assert.throws(()=>parseCSV('a,b\n1,2'),/Falta la columna/);
  assert.throws(()=>parseCSV('Issue key,Summary,Issue Type,Status\nSCRUM-1,"sin cerrar'),/comillas/);
});
