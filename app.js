'use strict';
const $=id=>document.getElementById(id);
let data=window.STORY_DATA, view='map';
const names={MUST:'Must',SHOULD:'Should',COULD:'Could',WONT:"Won’t",NONE:'Sin categorizar'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusClass=s=>s==='Finalizado'?'done':s==='Testing'?'testing':'todo';
function options(id,values,label){const old=$(id).value;$(id).innerHTML='<option value="">'+label+'</option>'+values.map(([v,t])=>'<option value="'+esc(v)+'">'+esc(t)+'</option>').join('');if(values.some(x=>x[0]===old))$(id).value=old;}
function setup(){
  options('epic',data.issues.filter(i=>i.type==='Epic').map(i=>[i.key,i.title]).concat([['none','Sin épica']]),'Todas las épicas');
  options('sprint',[...new Set(data.issues.filter(i=>i.type!=='Epic').map(StoryModel.lane))].sort(laneSort).map(v=>[v,v]),'Todos los incrementos');
  options('status',[...new Set(data.issues.map(i=>i.status))].sort().map(v=>[v,v]),'Todos los estados');
  options('priority',Object.entries(names),'Todas las categorías');
  $('date').textContent=data.date;
  const stories=data.issues.filter(i=>i.type==='Story');
  const stats=[[data.issues.length,'tickets importados'],[stories.length,'historias de usuario'],[data.issues.filter(i=>i.type==='Epic').length,'épicas'],[stories.filter(i=>i.status==='Finalizado').length,'historias finalizadas en Jira'],[stories.filter(i=>!i.sprint&&i.status!=='Finalizado').length,'historias en backlog futuro']];
  $('stats').innerHTML=stats.map(([n,t])=>'<div class="stat"><strong>'+n+'</strong><span>'+t+'</span></div>').join('');
  render();
}
function laneSort(a,b){if(a==='Backlog futuro')return -1;if(b==='Backlog futuro')return 1;const na=Number(a.match(/Sprint (\d+)/)?.[1]??-1),nb=Number(b.match(/Sprint (\d+)/)?.[1]??-1);return nb-na||a.localeCompare(b);}
function filtered(){const q=$('search').value.toLocaleLowerCase('es');return data.issues.filter(i=>(i.type==='Story'||($('tasks').checked&&i.type==='Task'))&&(!q||[i.key,i.title,i.description].join(' ').toLocaleLowerCase('es').includes(q))&&(!$('epic').value||(i.epic||'none')===$('epic').value)&&(!$('sprint').value||StoryModel.lane(i)===$('sprint').value)&&(!$('status').value||i.status===$('status').value)&&(!$('priority').value||i.moscow===$('priority').value));}
function card(i){return '<button class="card '+i.moscow.toLowerCase()+'" data-key="'+i.key+'"><span class="key">'+i.key+' · '+(i.type==='Task'?'Tarea':'Historia')+'</span><h3>'+esc(i.title)+'</h3><div class="meta"><span class="badge '+statusClass(i.status)+'">'+esc(i.status)+'</span><span class="points">'+(i.points?esc(i.points)+' SP':'Sin estimar')+'</span></div><span class="priority">'+names[i.moscow]+' · Jira: '+esc(i.priority)+'</span></button>';}
function render(){
  const items=filtered();$('result').textContent=items.length+' elementos visibles';
  if(!items.length){$('board').innerHTML='<p class="empty" style="padding:24px">No hay historias con estos filtros.</p>';return;}
  const epics=data.issues.filter(i=>i.type==='Epic').map(i=>({key:i.key,title:i.title}));
  if(items.some(i=>!i.epic))epics.push({key:'',title:'Sin épica asignada'});
  const columns=epics.filter(e=>!$('epic').value||e.key===($('epic').value==='none'?'':$('epic').value));
  if(view==='list'){
    $('board').innerHTML='<table class="list"><thead><tr><th>Ticket</th><th>Historia</th><th>Épica</th><th>Incremento</th><th>Prioridad</th><th>Estado Jira</th></tr></thead><tbody>'+items.map(i=>'<tr><td>'+i.key+'</td><td><button class="link" data-key="'+i.key+'">'+esc(i.title)+'</button></td><td>'+esc(epics.find(e=>e.key===i.epic)?.title||'Sin épica')+'</td><td>'+esc(StoryModel.lane(i))+'</td><td>'+names[i.moscow]+'</td><td>'+esc(i.status)+'</td></tr>').join('')+'</tbody></table>';
  }else{
    const lanes=[...new Set(items.map(StoryModel.lane))].sort(laneSort);
    $('board').innerHTML='<table style="min-width:'+Math.max(600,170+columns.length*230)+'px"><thead><tr><th>Alcance / Sprint</th>'+columns.map(e=>'<th>'+esc(e.title)+'<small>'+esc(e.key)+'</small></th>').join('')+'</tr></thead><tbody>'+lanes.map(l=>{
      const future=l==='Backlog futuro',uns=l.startsWith('Sin sprint');
      return '<tr class="'+(future?'future':uns?'unassigned':'mvp')+'"><th>'+esc(l)+'<small>'+(future?'EVOLUCIÓN · Sin sprint comprometido':uns?'Asignación histórica pendiente':'MVP · Incremento del producto')+'<br>'+items.filter(i=>StoryModel.lane(i)===l).length+' elementos</small></th>'+columns.map(e=>{const group=items.filter(i=>i.epic===e.key&&StoryModel.lane(i)===l);return '<td>'+(group.length?group.map(card).join(''):'<span class="empty">Sin historias</span>')+'</td>';}).join('')+'</tr>';
    }).join('')+'</tbody><tfoot><tr><th>Épicas</th>'+columns.map(e=>'<td>'+esc(e.title)+'</td>').join('')+'</tr></tfoot></table>';
  }
}
function detail(key){
  const i=data.issues.find(i=>i.key===key);if(!i)return;
  $('detailKey').textContent=i.key+' / '+(i.type==='Task'?'Tarea':'Historia de usuario');
  const children=data.issues.filter(c=>c.parent===i.key);
  $('detailBody').innerHTML='<h2>'+esc(i.title)+'</h2><div class="meta"><span class="badge '+statusClass(i.status)+'">'+esc(i.status)+'</span><span class="badge">'+names[i.moscow]+'</span><span class="badge">'+esc(StoryModel.lane(i))+'</span><span class="badge">Prioridad Jira: '+esc(i.priority)+'</span></div><h3>Historia</h3><div class="source">'+esc(i.description||'Sin descripción en la exportación.')+'</div><h3>Criterios de aceptación</h3><div class="source">'+esc(i.criteria||'Sin criterios en la exportación.')+'</div><h3>Subtareas ('+children.length+')</h3>'+children.map(c=>'<details><summary>'+c.key+' · '+esc(c.title)+' — '+esc(c.status)+'</summary><p class="source">'+esc(c.description||'Sin descripción.')+'</p></details>').join('')+'<p><a target="_blank" rel="noopener noreferrer" href="https://grupoecommerce.atlassian.net/browse/'+i.key+'">Abrir '+i.key+' en Jira ↗</a></p>';
  $('detail').showModal();
}
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
['search','epic','sprint','status','priority','tasks'].forEach(id=>$(id).addEventListener('input',render));
$('reset').onclick=()=>{['search','epic','sprint','status','priority'].forEach(id=>$(id).value='');$('tasks').checked=false;render();};
$('board').onclick=e=>{const c=e.target.closest('[data-key]');if(c)detail(c.dataset.key);};
$('close').onclick=()=>$('detail').close();
$('detail').addEventListener('click',e=>{if(e.target===$('detail')){const r=$('detail').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('detail').close();}});
for(const [id,v] of [['mapView','map'],['listView','list']])$(id).onclick=()=>{view=v;$('mapView').setAttribute('aria-pressed',v==='map');$('listView').setAttribute('aria-pressed',v==='list');render();};
$('print').onclick=()=>window.print();
$('export').onclick=()=>download('data.js','window.STORY_DATA = '+JSON.stringify(data,null,2)+';\n','text/javascript;charset=utf-8');
$('import').onchange=async e=>{try{const file=e.target.files[0];if(!file)return;const issues=StoryModel.normalize(StoryModel.parseCSV(await file.text()));if(!issues.length)throw Error('El CSV está vacío.');data={date:'Importado el '+new Date().toLocaleDateString('es'),issues};setup();$('message').textContent='CSV importado para esta sesión. Para compartir la actualización: pulsa Exportar datos, reemplaza data.js en el repositorio y publica el cambio.';}catch(err){$('message').textContent=err.message;}finally{e.target.value='';}};
setup();
