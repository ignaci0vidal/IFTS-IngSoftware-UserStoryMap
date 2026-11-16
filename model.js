(function(root){
  'use strict';
  function parseCSV(text){
    const rows=[];let row=[],cell='',quoted=false;
    text=text.replace(/^\uFEFF/,'');
    for(let i=0;i<text.length;i++){
      const c=text[i];
      if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
      else if(c===','&&!quoted){row.push(cell);cell='';}
      else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(Boolean))rows.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(quoted)throw Error('CSV inválido: comillas sin cerrar.');
    if(cell||row.length){row.push(cell);rows.push(row);}
    const headers=rows.shift()||[];
    for(const key of ['Issue key','Summary','Issue Type','Status'])if(!headers.includes(key))throw Error('Falta la columna '+key+'. Exporta CSV con todos los campos.');
    return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,values[i]||''])));
  }
  function normalize(rows){
    const issues=rows.map(r=>({
      key:r['Issue key'],title:r.Summary,type:r['Issue Type'],status:r.Status,
      priority:r.Priority||'Sin prioridad',moscow:['MUST','SHOULD','COULD','WONT'].includes(r['Custom field (Prioridad)'])?r['Custom field (Prioridad)']:'NONE',
      sprint:r.Sprint||'',points:r['Custom field (Story point estimate)']||'',
      parent:r['Parent key']||'',description:r.Description||'',criteria:r['Custom field (Criterios de Aceptación)']||''
    }));
    const keys=new Set();
    for(const i of issues){if(!/^SCRUM-\d+$/.test(i.key))throw Error('El CSV debe corresponder al proyecto SCRUM.');if(keys.has(i.key))throw Error('Ticket duplicado: '+i.key);keys.add(i.key);}
    const byKey=new Map(issues.map(i=>[i.key,i]));
    for(const i of issues){let p=i,seen=new Set();i.epic='';while(p&&!seen.has(p.key)){seen.add(p.key);if(p.type==='Epic'){i.epic=p.key;break;}p=byKey.get(p.parent);}}
    return issues;
  }
  function lane(i){if(i.sprint)return i.sprint;return i.status==='Finalizado'?'Sin sprint · finalizado':'Backlog futuro';}
  const api={parseCSV,normalize,lane};if(typeof module!=='undefined')module.exports=api;else root.StoryModel=api;
})(typeof window!=='undefined'?window:globalThis);
