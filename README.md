# ECOMMERCEAPP · User Story Map

Proyecto independiente para la entrega de Ingeniería de Software del IFTS 16.
HTML, CSS y JavaScript sin dependencias ni compilación. Funciona abriendo
`index.html` y puede publicarse como sitio estático.

## Contenido

- 134 tickets de la exportación de Jira del 16/11/2026.
- 62 historias, 60 subtareas, 4 tareas y 8 épicas.
- Backlog arriba; Sprints 3, 2 y 1 debajo, dentro del alcance del MVP.
- 12 historias nuevas sin sprint, dentro de Backlog futuro.
- Dos historias finalizadas sin sprint aparecen en una fila independiente:
  no se inventa su asignación histórica.
- Must en verde, Should en azul, Could en violeta. Las 33 historias sin
  categoría MoSCoW quedan neutras. La prioridad estándar de Jira
  (High/Medium/Low) se muestra por separado.
- Los estados reflejan Jira: no se convierten automáticamente a Finalizado.
- Búsqueda, filtros, vista de lista, detalle, criterios y subtareas.
- Impresión horizontal A3 y actualización mediante CSV.

## Abrir

Abre `index.html` en un navegador. No requiere instalar paquetes.
Para servirlo por HTTP, desde esta carpeta ejecuta:

```powershell
python -m http.server 8080
```

Visita http://localhost:8080.

## Publicar en GitHub Pages

1. Crea un repositorio vacío en GitHub.
2. Desde esta carpeta, ejecuta:

```powershell
git init
git add .
git commit -m "Crear mapa interactivo de historias del ecommerce"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

3. En el repositorio abre Settings → Pages.
4. Selecciona Deploy from a branch, rama main, carpeta / (root), y guarda.
5. Abre la dirección publicada que indique GitHub.

El contenido publicado es visible según la configuración de acceso de tu
hosting. El proyecto distribuye únicamente los campos necesarios del mapa;
no incluye el CSV original, emails, IDs de cuentas ni comentarios de Jira.
Los enlaces a Jira siguen requiriendo acceso al proyecto.

## Actualizar con nuevos tickets

1. Exporta todos los campos del proyecto SCRUM en CSV.
2. En el mapa pulsa Importar CSV y selecciona el archivo.
3. Revisa el mapa. La importación solo modifica la sesión abierta.
4. Pulsa Exportar datos y reemplaza `data.js` por el archivo descargado.
5. Sube el cambio al repositorio:

```powershell
git add data.js
git commit -m "Actualizar mapa con el backlog de Jira"
git push
```

No hay sincronización automática ni cambios en Jira. No se necesitan tokens.
El CSV importado se procesa en el navegador y no se envía a un servidor.
Exportar datos conserva únicamente el modelo del mapa, no el CSV original.

## Verificación

Con Node.js instalado:

```powershell
npm test
```

Las pruebas cubren CSV con caracteres escapados y saltos de línea, resolución
de épicas a través del padre, filas sin sprint y validación de entradas.

## Archivos

- index.html: página y controles.
- styles.css: diseño adaptable y formato de impresión.
- data.js: instantánea pública de los tickets.
- model.js: lectura de CSV, normalización y agrupación.
- app.js: interacción y representación del mapa.
- tests/model.test.js: pruebas del importador.

El mapa pertenece al ecommerce de Ingeniería de Software; no incorpora
requisitos ni arquitectura del proyecto de PP3.
