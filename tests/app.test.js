const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
test('renderiza datos reales, filtra backlog y abre criterios',()=>{
  const elements=new Map();
  const document={getElementById(id){if(!elements.has(id))elements.set(id,{value:'',checked:false,innerHTML:'',textContent:'',addEventListener(){},setAttribute(name,value){this[name]=String(value);},showModal(){this.open=true;},close(){this.open=false;}});return elements.get(id);}};
  const context=vm.createContext({document,window:{},StoryModel:require('../model.js'),console,Blob,URL,setTimeout});
  vm.runInContext(fs.readFileSync(require.resolve('../data.js'),'utf8'),context);
  vm.runInContext(fs.readFileSync(require.resolve('../app.js'),'utf8'),context);
  assert.match(elements.get('result').textContent,/60 elementos/);
  assert.match(elements.get('board').innerHTML,/SCRUM-147/);
  const board=elements.get('board');
  assert.doesNotMatch(board.innerHTML,/Sin sprint · finalizado|data-key="SCRUM-(44|47)"/);
  const epicTitles=vm.runInContext("data.issues.filter(i=>i.type==='Epic').map(i=>i.title)",context);
  assert.equal(epicTitles.length,8);
  for(const title of epicTitles){
    assert.ok(board.innerHTML.split('</thead>')[0].includes(title));
    assert.ok(board.innerHTML.split('<tfoot>')[1].includes(title));
  }
  elements.get('listView').onclick();
  assert.match(elements.get('result').textContent,/62 elementos/);
  assert.match(board.innerHTML,/SCRUM-44/);
  assert.match(board.innerHTML,/SCRUM-47/);
  assert.equal(vm.runInContext("data.issues.filter(i=>['SCRUM-44','SCRUM-47'].includes(i.key)&&!i.sprint).length",context),2);
  elements.get('mapView').onclick();
  elements.get('tasks').checked=true;
  vm.runInContext('render()',context);
  assert.doesNotMatch(board.innerHTML,/Sin sprint · finalizado|data-key="SCRUM-(44|47)"/);
  elements.get('tasks').checked=false;
  for(const priority of ['MUST','SHOULD','COULD','NONE']){
    elements.get('filter-'+priority).onclick();
    assert.equal(elements.get('priority').value,priority);
    assert.equal(elements.get('filter-'+priority)['aria-pressed'],'true');
    const keys=[...board.innerHTML.matchAll(/data-key="([^"]+)"/g)].map(match=>match[1]);
    const expected=vm.runInContext("data.issues.filter(i=>i.type==='Story'&&i.moscow==='"+priority+"'&&StoryModel.lane(i)!=='Sin sprint · finalizado').map(i=>i.key)",context);
    assert.deepEqual(keys.sort(),Array.from(expected).sort());
  }
  elements.get('filter-NONE').onclick();
  assert.equal(elements.get('priority').value,'');
  assert.equal(elements.get('filter-NONE')['aria-pressed'],'false');
  assert.match(elements.get('result').textContent,/60 elementos/);
  elements.get('priority').value='SHOULD';
  vm.runInContext('render()',context);
  assert.equal(elements.get('filter-SHOULD')['aria-pressed'],'true');
  elements.get('reset').onclick();
  assert.equal(elements.get('filter-SHOULD')['aria-pressed'],'false');

  elements.get('sprint').value='Sin sprint · finalizado';
  vm.runInContext('render()',context);
  assert.match(elements.get('result').textContent,/0 elementos/);
  elements.get('sprint').value='Backlog futuro';
  vm.runInContext('render()',context);
  assert.match(elements.get('result').textContent,/12 elementos/);
  elements.get('search').value='SCRUM-144';
  vm.runInContext('render();detail("SCRUM-144")',context);
  assert.match(elements.get('result').textContent,/1 elementos/);
  assert.equal(elements.get('detail').open,true);
  assert.match(elements.get('detailBody').innerHTML,/Criterios de aceptación/);
  assert.match(elements.get('detailBody').innerHTML,/historial de movimientos/i);
});
