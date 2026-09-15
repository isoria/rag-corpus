# Manual de Usuario
## Sistema de Gestión y Trazabilidad del Corpus RAG - UNAJMA

**Versión:** 1.0  
**Aplicación:** Corpus RAG - UNAJMA  
**Tecnologías:** Angular + Firebase  
**Propósito:** Gestión, documentación, curación y trazabilidad de documentos destinados a sistemas RAG.

---

## 1. Introducción

La aplicación **Corpus RAG - UNAJMA** permite gestionar el flujo documental utilizado para construir un corpus destinado posteriormente a un sistema de Recuperación Aumentada por Generación (RAG).

La aplicación cubre el proceso desde el registro del documento original hasta la creación y exportación de los **chunks con metadatos**.

El sistema no realiza directamente la vectorización, la generación de embeddings ni la consulta mediante LangChain. Su finalidad es preparar un corpus limpio, organizado, trazable y auditable.

El flujo general es:

```text
Documento original
      ↓
OCR
      ↓
Texto limpio
      ↓
Documento estructurado
      ↓
Metadatos
      ↓
Chunks + metadata
      ↓
Exportación chunks.jsonl
      ↓
LangChain / Embeddings / FAISS
```

---

## 2. Objetivo del sistema

El sistema permite:

- Registrar documentos del corpus.
- Asignar un código único a cada documento.
- Almacenar el archivo original.
- Registrar productos de OCR.
- Registrar archivos de texto limpio.
- Registrar archivos estructurados.
- Mantener versiones de los archivos.
- Calcular y almacenar el hash SHA-256.
- Registrar metadatos documentales.
- Crear chunks manualmente.
- Asociar cada chunk con el archivo del cual procede.
- Registrar páginas, capítulos, artículos y otros metadatos.
- Editar chunks sin perder versiones anteriores.
- Consultar el historial de modificaciones.
- Desactivar chunks sin eliminarlos.
- Exportar los chunks activos en formato `JSONL`.
- Mantener trazabilidad desde cada chunk hasta el documento original.

---

## 3. Acceso a la aplicación

La aplicación se ejecuta mediante un navegador web.

Durante el desarrollo local:

```text
http://localhost:4200
```

La pantalla principal muestra el módulo:

```text
Corpus RAG - UNAJMA
```

Desde el menú principal se puede acceder a:

```text
Documentos
```

---

## 4. Pantalla de documentos

La pantalla **Corpus documental** muestra todos los documentos registrados.

La tabla contiene información como:

| Campo | Descripción |
|---|---|
| Código | Identificador único del documento |
| Documento | Título del documento |
| Tipo | Reglamento, resolución, directiva, etc. |
| Año | Año del documento |
| Vigencia | Vigente, derogado o desconocido |
| Etapa | Estado actual del procesamiento |
| Acciones | Abrir o editar |

Los códigos se generan automáticamente.

Ejemplo:

```text
DOC000001
DOC000002
DOC000003
```

---

## 5. Registrar un nuevo documento

Para registrar un documento:

1. Ingresar a **Documentos**.
2. Pulsar **Nuevo documento**.
3. Completar los campos solicitados.
4. Pulsar **Guardar**.

### Campos principales

#### Título

Registrar el título oficial del documento.

Ejemplo:

```text
Reglamento General de Investigación
```

#### Tipo de documento

Seleccionar una opción:

- Estatuto
- Reglamento
- Directiva
- Resolución
- Manual
- Lineamiento
- Convenio
- Otro

#### Año

Registrar el año asociado al documento.

Ejemplo:

```text
2026
```

#### Unidad responsable

Ejemplo:

```text
Vicerrectorado de Investigación
```

#### Fecha de publicación

Registrar la fecha, cuando se encuentre disponible.

#### Vigencia

Seleccionar:

```text
VIGENTE
DEROGADO
DESCONOCIDO
```

#### URL de origen

Registrar la dirección web oficial desde donde se obtuvo el documento, cuando corresponda.

---

## 6. Estados del procesamiento

Cada documento mantiene un estado de procesamiento.

Los principales estados son:

```text
INGESTED
OCR
CLEAN
METADATA
CHUNKED
READY
```

### INGESTED

El documento ha sido registrado y se dispone del archivo original.

### OCR

Se han registrado los archivos obtenidos mediante reconocimiento óptico de caracteres.

### CLEAN

Se dispone del texto limpio y normalizado.

### METADATA

Se han registrado los metadatos y/o el documento estructurado.

### CHUNKED

El documento ya dispone de chunks.

### READY

El documento se considera listo para formar parte del dataset RAG.

---

## 7. Abrir un documento

Desde la tabla principal pulsar:

```text
Abrir
```

La pantalla de detalle presenta:

- Código.
- Título.
- Tipo.
- Año.
- Unidad responsable.
- Vigencia.
- Estado del procesamiento.
- Archivos asociados.
- Metadatos.
- Chunks.
- Historial.

---

## 8. Carga del documento original

En la sección:

```text
1. Documento original
```

seleccionar el archivo correspondiente.

Formatos admitidos pueden incluir:

```text
PDF
DOC
DOCX
JPG
JPEG
PNG
TIF
TIFF
```

Luego pulsar:

```text
Guardar original
```

El sistema realiza automáticamente las siguientes operaciones:

1. Calcula el hash SHA-256.
2. Asigna una versión.
3. Guarda el archivo en Firebase Storage.
4. Registra los datos del archivo en Firestore.
5. Conserva la trazabilidad con el documento.

Ejemplo de almacenamiento:

```text
corpus/
└── DOC000001/
    └── original/
        └── v1/
            └── reglamento.pdf
```

---

## 9. Versionado de archivos

Los archivos no se sobrescriben.

Si se carga una nueva versión del documento original:

```text
original/
├── v1/
│   └── reglamento.pdf
└── v2/
    └── reglamento.pdf
```

El sistema mantiene:

```text
v1 → current = false
v2 → current = true
```

Esto permite conservar versiones anteriores y asegurar la trazabilidad.

---

## 10. Hash SHA-256

Cada archivo cargado registra un hash SHA-256.

Ejemplo:

```text
e1b2f0a6...
```

El hash permite:

- Verificar integridad.
- Detectar modificaciones.
- Identificar duplicados.
- Confirmar que un archivo sigue siendo exactamente el mismo.

Si cambia un solo byte del archivo, el hash cambia.

---

## 11. Registrar los productos del OCR

En:

```text
2. Resultado OCR
```

se pueden cargar uno o varios archivos.

Ejemplos:

```text
reglamento_ocr.pdf
reglamento_ocr.txt
```

Estos archivos quedan registrados como:

```text
stage = OCR
```

y vinculados a los archivos fuente utilizados para generarlos.

Ejemplo:

```text
ORIGINAL
   ↓
OCR PDF
OCR TXT
```

---

## 12. Registrar el texto limpio

En:

```text
3. Texto limpio
```

se carga el archivo obtenido luego de eliminar ruido, errores y elementos innecesarios.

Ejemplo:

```text
reglamento_clean.txt
```

Debe conservarse la estructura normativa:

```text
CAPÍTULO IV

Artículo 23.- Requisitos...

Artículo 24.- Evaluación...
```

No se recomienda eliminar:

- títulos;
- capítulos;
- artículos;
- numerales;
- incisos;
- literales;
- disposiciones;
- anexos relevantes.

---

## 13. Registrar el documento estructurado

En:

```text
4. Documento estructurado
```

se puede registrar una representación estructurada.

Ejemplo:

```text
reglamento.json
```

Puede contener:

```json
{
  "titulo": "Reglamento General de Investigación",
  "capitulos": [
    {
      "capitulo": "IV",
      "articulos": [
        {
          "articulo": "23",
          "texto": "..."
        }
      ]
    }
  ]
}
```

Este archivo es opcional para LangChain, pero es útil para:

- preservar estructura;
- facilitar chunking;
- mantener trazabilidad;
- realizar controles de calidad.

---

## 14. Metadatos documentales

La aplicación dispone de una sección para registrar metadatos adicionales.

Campos disponibles:

- Resolución de aprobación.
- Fecha de aprobación.
- Número de páginas.
- Idioma.
- Descripción.
- Palabras clave.
- Observaciones.

Ejemplo:

```text
Resolución:
R.C.U. N.° 010-2026-UNAJMA/CU

Idioma:
es

Palabras clave:
grados, títulos, estudiantes, universidad
```

---

## 15. Editor de chunks

La sección **Editor de chunks** permite construir manualmente los fragmentos que posteriormente serán utilizados por LangChain.

La interfaz se divide conceptualmente en dos áreas:

```text
┌─────────────────────────┬────────────────────────────┐
│ Texto fuente            │ Nuevo chunk               │
│                         │                            │
│ Documento limpio        │ Metadatos                  │
│                         │                            │
│ Selección de texto      │ Contenido                  │
└─────────────────────────┴────────────────────────────┘
```

---

## 16. Seleccionar el archivo fuente

Antes de crear un chunk se debe indicar el archivo del cual procede.

Por ejemplo:

```text
CLEAN - reglamento_clean.txt
```

Al seleccionar un archivo de texto, su contenido aparece en la parte izquierda del editor.

El sistema registra el identificador interno:

```text
sourceFileId
```

Esto permite conocer posteriormente exactamente qué archivo generó el chunk.

---

## 17. Crear un chunk mediante selección

Para crear un chunk:

1. Seleccionar el archivo fuente.
2. Localizar el texto en el panel izquierdo.
3. Seleccionar con el ratón el fragmento deseado.
4. Pulsar:

```text
Usar selección como chunk
```

5. Revisar el texto copiado.
6. Completar los metadatos.
7. Pulsar:

```text
Crear chunk
```

---

## 18. Metadatos de un chunk

Cada chunk puede registrar:

- Página inicial.
- Página final.
- Capítulo.
- Título del capítulo.
- Sección.
- Artículo.
- Inciso o subsección.
- Archivo fuente.
- Vigencia.
- Tipo documental.
- Título del documento.

Ejemplo:

```text
Código:
DOC000001-CHK0007

Página inicial:
14

Página final:
14

Capítulo:
IV

Artículo:
23
```

Contenido:

```text
Artículo 23.- El proyecto de investigación deberá contener...
```

---

## 19. Identificación de chunks

Los códigos se generan automáticamente.

Ejemplo:

```text
DOC000001-CHK0001
DOC000001-CHK0002
DOC000001-CHK0003
```

El código permite reconocer inmediatamente a qué documento pertenece el fragmento.

---

## 20. Trazabilidad de un chunk

La aplicación permite reconstruir una cadena como:

```text
DOC000001-CHK0017
        ↓
DOC000001
        ↓
Reglamento General de Investigación
        ↓
reglamento_clean.txt
        ↓
versión 2
        ↓
Página 34
        ↓
Capítulo IV
        ↓
Artículo 27
```

Esta trazabilidad permite revisar posteriormente cualquier error detectado durante la recuperación semántica.

---

## 21. Editar un chunk

Para corregir un chunk:

1. Localizarlo en la tabla.
2. Pulsar:

```text
Editar
```

3. Modificar el texto o sus metadatos.
4. Seleccionar el motivo de la modificación.
5. Registrar una observación.
6. Pulsar:

```text
Guardar corrección
```

La versión anterior no se elimina.

---

## 22. Motivos de corrección

Los motivos disponibles incluyen:

```text
ERROR_OCR
ERROR_TRANSCRIPCION
ERROR_CHUNKING
METADATO_INCORRECTO
OTRO
```

Ejemplo:

```text
Motivo:
ERROR_OCR

Observación:
Se corrigió "sera" por "será".
```

---

## 23. Historial de revisiones

Cada chunk dispone de:

```text
Historial
```

La aplicación conserva:

- contenido anterior;
- metadatos anteriores;
- páginas;
- archivo fuente;
- número de revisión;
- motivo del cambio;
- observación.

Ejemplo:

```text
Revisión 1
Los proyectos sera evaluados...

Revisión 2
Los proyectos serán evaluados...
```

La revisión actual permanece en el documento principal del chunk.

---

## 24. Desactivar un chunk

Cuando un chunk deja de ser válido no se recomienda eliminarlo.

Se utiliza:

```text
Desactivar
```

Internamente:

```text
active = false
```

De esta forma:

- no se exporta;
- no se utiliza en el dataset final;
- permanece disponible para auditoría.

---

## 25. Exportar el dataset RAG

Desde la pantalla principal pulsar:

```text
Exportar dataset RAG
```

La aplicación recopila los chunks:

```text
active = true
```

y genera:

```text
chunks.jsonl
```

---

## 26. Formato del archivo JSONL

Cada línea contiene un chunk independiente.

Ejemplo:

```json
{"page_content":"Artículo 23.- El proyecto de investigación deberá contener...","metadata":{"document_code":"DOC000001","chunk_code":"DOC000001-CHK0001","source_file_id":"FILE003","page_start":14,"page_end":14,"chapter":"IV","article":"23","validity":"VIGENTE"}}
```

El siguiente chunk aparece en otra línea:

```json
{"page_content":"Artículo 24.- Los proyectos serán evaluados...","metadata":{"document_code":"DOC000001","chunk_code":"DOC000001-CHK0002","source_file_id":"FILE003","page_start":15,"page_end":15,"chapter":"IV","article":"24","validity":"VIGENTE"}}
```

---

## 27. Uso posterior con LangChain

El archivo exportado puede cargarse en Python.

Ejemplo:

```python
import json

from langchain_core.documents import Document

documents = []

with open(
    "chunks.jsonl",
    encoding="utf-8"
) as f:

    for line in f:

        item = json.loads(line)

        documents.append(
            Document(
                page_content=item["page_content"],
                metadata=item["metadata"]
            )
        )
```

Posteriormente:

```text
documents
    ↓
embeddings
    ↓
FAISS
    ↓
Retriever
    ↓
RAG
```

---

## 28. Organización de archivos

La organización recomendada en Firebase Storage es:

```text
corpus/

└── DOC000001/

    ├── original/
    │   └── v1/
    │       └── documento.pdf
    │
    ├── ocr/
    │   └── v1/
    │       ├── documento_ocr.pdf
    │       └── documento_ocr.txt
    │
    ├── clean/
    │   └── v1/
    │       └── documento_clean.txt
    │
    └── structured/
        └── v1/
            └── documento.json
```

---

## 29. Organización de datos en Firestore

La estructura conceptual es:

```text
documents
│
└── DOC
    │
    ├── metadata
    │
    ├── files
    │   ├── ORIGINAL
    │   ├── OCR
    │   ├── CLEAN
    │   └── STRUCTURED
    │
    └── chunks
        │
        ├── CHUNK
        │    │
        │    └── revisions
        │
        └── CHUNK
```

---

## 30. Buenas prácticas

### No modificar el documento original

El archivo original debe conservarse sin alteraciones.

Las correcciones deben realizarse en productos posteriores:

```text
OCR
CLEAN
STRUCTURED
CHUNKS
```

### No eliminar versiones anteriores

Siempre utilizar el sistema de versionado.

### No eliminar chunks con errores

Corregirlos o desactivarlos.

### Mantener metadatos suficientes

Como mínimo registrar:

```text
document_code
chunk_code
source_file_id
page_start
page_end
```

Para documentos normativos es recomendable añadir:

```text
chapter
section
article
subsection
validity
```

### Revisar el archivo fuente

Antes de guardar un chunk comprobar que `sourceFileId` corresponde al archivo realmente utilizado.

---

## 31. Flujo recomendado de trabajo

Para cada documento seguir esta secuencia:

```text
1. Registrar documento

2. Cargar original

3. Registrar OCR
   si corresponde

4. Registrar texto limpio

5. Registrar documento estructurado
   si corresponde

6. Completar metadatos

7. Seleccionar texto fuente

8. Crear chunks

9. Revisar chunks

10. Corregir errores

11. Desactivar fragmentos inválidos

12. Exportar dataset
```

---

## 32. Ejemplo completo

Documento:

```text
DOC000001
Reglamento General de Investigación
```

Archivo original:

```text
reglamento.pdf
```

OCR:

```text
reglamento_ocr.pdf
reglamento_ocr.txt
```

Texto limpio:

```text
reglamento_clean.txt
```

Documento estructurado:

```text
reglamento.json
```

Chunk:

```text
DOC000001-CHK0001
```

Contenido:

```text
Artículo 23.- El proyecto de investigación deberá contener
como mínimo título, problema, objetivos, metodología,
presupuesto y cronograma.
```

Metadatos:

```text
Página: 14
Capítulo: IV
Artículo: 23
Fuente: reglamento_clean.txt
```

Exportación:

```json
{"page_content":"Artículo 23.- El proyecto de investigación deberá contener como mínimo...","metadata":{"document_code":"DOC000001","chunk_code":"DOC000001-CHK0001","page_start":14,"page_end":14,"chapter":"IV","article":"23"}}
```

---

## 33. Resultado final del sistema

El producto final de la aplicación es un corpus:

- documentado;
- versionado;
- trazable;
- corregible;
- auditable;
- independiente del modelo de embeddings;
- preparado para LangChain.

La aplicación termina su responsabilidad en:

```text
chunks + metadata
```

La etapa posterior del proyecto RAG realiza:

```text
chunks.jsonl
      ↓
LangChain Document
      ↓
Embeddings
      ↓
FAISS
      ↓
Retriever
      ↓
LLM
```

---

## 34. Soporte metodológico

La estructura del sistema permite responder preguntas como:

- ¿De qué documento procede este chunk?
- ¿Qué archivo fue utilizado como fuente?
- ¿Qué versión del archivo produjo el fragmento?
- ¿Qué página originó el chunk?
- ¿A qué artículo pertenece?
- ¿Fue corregido?
- ¿Cuál era su contenido antes de la corrección?
- ¿El chunk sigue activo?
- ¿Qué fragmentos fueron utilizados para construir el dataset final?

Estas capacidades constituyen el mecanismo de trazabilidad del corpus documental utilizado en el proyecto RAG.
