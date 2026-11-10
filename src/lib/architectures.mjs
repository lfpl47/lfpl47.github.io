// Architecture explorer on Home: clouds, patterns, layouts, strings and the SVG markup.
// The build renders the default scheme with it (shown without JavaScript) and the client script renders every
// other scheme with the same functions, so both always draw the same thing.
// The services illustrate common architectures on each cloud. They are not a list of tools Luis used.

export const DEFAULT = { family: "data", cloud: "gcp", pattern: "etl" };
export const FAMILIES = {
  data: ["etl", "elt", "events", "streaming", "warehouse", "lakehouse"],
  software: ["rest", "modular", "layers", "serverless", "microservices", "async"],
};

const svc = (short, full, file) => ({ short, full, icon: `/arch/${file}.svg` });

// Names as each vendor writes them, checked on 2026-11-09 (Dataproc is now Managed Service for Apache Spark,
// docs.cloud.google.com/managed-spark; AWS shortens its Flink service to Managed Service for Apache Flink,
// docs.aws.amazon.com/managed-flink; Azure Data Lake Storage dropped «Gen2», learn.microsoft.com overview).
// `sink` is where the streaming pattern writes.
export const CLOUDS = {
  gcp: {
    name: "Google Cloud",
    label: "GCP",
    format: "Apache Iceberg",
    formatShort: "Iceberg",
    dialect: "SQL",
    sink: "warehouse",
    services: {
      storage: svc("Cloud Storage", "Cloud Storage", "gcp/cloud-storage"),
      pipeline: svc("Dataflow", "Dataflow", "gcp/dataflow"),
      warehouse: svc("BigQuery", "BigQuery", "gcp/bigquery"),
      events: svc("Pub/Sub", "Pub/Sub", "gcp/pubsub"),
      stream: svc("Pub/Sub", "Pub/Sub", "gcp/pubsub"),
      streamProc: svc("Dataflow", "Dataflow", "gcp/dataflow"),
      spark: svc("Managed Service for Apache Spark", "Managed Service for Apache Spark", "gcp/managed-spark"),
      app: svc("Cloud Run", "Cloud Run", "gcp/cloud-run"),
      fn: svc("Cloud Run functions", "Cloud Run functions", "gcp/cloud-run-functions"),
      sql: svc("Cloud SQL", "Cloud SQL", "gcp/cloud-sql"),
      gateway: svc("API Gateway", "API Gateway", "gcp/api-gateway"),
      document: svc("Firestore", "Firestore", "gcp/firestore"),
      queue: svc("Pub/Sub", "Pub/Sub", "gcp/pubsub"),
    },
  },
  aws: {
    name: "AWS",
    label: "AWS",
    format: "Apache Iceberg",
    formatShort: "Iceberg",
    dialect: "SQL",
    sink: "storage",
    services: {
      storage: svc("Amazon S3", "Amazon S3", "aws/s3"),
      pipeline: svc("AWS Glue", "AWS Glue", "aws/glue"),
      warehouse: svc("Redshift", "Amazon Redshift", "aws/redshift"),
      events: svc("Amazon SNS", "Amazon SNS", "aws/sns"),
      stream: svc("Kinesis", "Amazon Kinesis Data Streams", "aws/kinesis-data-streams"),
      streamProc: svc("Managed Service for Apache Flink", "Amazon Managed Service for Apache Flink", "aws/managed-flink"),
      spark: svc("Amazon EMR", "Amazon EMR", "aws/emr"),
      app: svc("Fargate", "AWS Fargate", "aws/fargate"),
      fn: svc("Lambda", "AWS Lambda", "aws/lambda"),
      sql: svc("Amazon RDS", "Amazon RDS", "aws/rds"),
      gateway: svc("API Gateway", "Amazon API Gateway", "aws/api-gateway"),
      document: svc("DynamoDB", "Amazon DynamoDB", "aws/dynamodb"),
      queue: svc("Amazon SQS", "Amazon SQS", "aws/sqs"),
    },
  },
  azure: {
    name: "Azure",
    label: "Azure",
    format: "Delta Lake",
    formatShort: "Delta",
    dialect: "T-SQL",
    sink: "storage",
    services: {
      storage: svc("Data Lake Storage", "Azure Data Lake Storage", "azure/data-lake-storage"),
      pipeline: svc("Data Factory", "Azure Data Factory", "azure/data-factory"),
      warehouse: svc("Synapse", "Azure Synapse Analytics", "azure/synapse"),
      events: svc("Event Grid", "Azure Event Grid", "azure/event-grid"),
      stream: svc("Event Hubs", "Azure Event Hubs", "azure/event-hubs"),
      streamProc: svc("Stream Analytics", "Azure Stream Analytics", "azure/stream-analytics"),
      spark: svc("Databricks", "Azure Databricks", "azure/databricks"),
      app: svc("App Service", "Azure App Service", "azure/app-service"),
      fn: svc("Functions", "Azure Functions", "azure/functions"),
      sql: svc("Azure SQL", "Azure SQL Database", "azure/sql-database"),
      gateway: svc("API Management", "Azure API Management", "azure/api-management"),
      document: svc("Cosmos DB", "Azure Cosmos DB", "azure/cosmos-db"),
      queue: svc("Service Bus", "Azure Service Bus", "azure/service-bus"),
    },
  },
};

export const TEXT = {
  en: {
    families: { data: "Data engineering", software: "Software engineering" },
    title: "{pattern} · {cloud}",
    lead: "Illustrative scheme.",
    patterns: {
      etl: ["ETL", "Transform before loading", "{storage} receives the source files, {pipeline} transforms them and the result is loaded into {warehouse}."],
      elt: ["ELT", "Load first, transform in the warehouse", "{storage} holds the source files. They are loaded unchanged into raw tables in {warehouse}, where {dialect} turns them into curated tables."],
      events: ["Event-driven", "A bus decouples producers and consumers", "An application publishes each event to {events}, which delivers a copy to two independent consumers on {fn}. The producer does not know who reads its events."],
      streaming: ["Streaming", "Continuous events, processed in time windows", "Events arrive continuously in {stream}. {streamProc} groups them into time windows and writes the result of each window to {sink}."],
      warehouse: ["Data warehouse", "A star schema for analytical queries", "Data is loaded into a star schema in {warehouse}, with a sales fact table joined to product, customer and date dimensions. BI dashboards query the model."],
      lakehouse: ["Lakehouse", "Table layers on object storage", "{format} tables on {storage}, in three layers. Bronze keeps the raw data, silver the cleaned data and gold the business-ready data, and {spark} processes each step."],
      rest: ["REST API", "Request, query and JSON response", "The client sends GET /orders to {gateway}, which routes it to the API on {app}. The API queries {sql} and the JSON response returns along the same path."],
      modular: ["Modular monolith", "Modules with internal interfaces, one deployment", "One application on {app}, deployed as a single unit. The orders module calls the users and catalog modules through internal interfaces, and each of those modules keeps its own tables in {sql}."],
      layers: ["Layered API", "Controller, service and repository", "A request crosses three layers of one application on {app}. The controller handles HTTP, the service applies the business rules and the repository queries {sql}. The result returns layer by layer as JSON."],
      serverless: ["Serverless API", "One function per route", "Two independent routes, where GET /orders reads and POST /orders writes. {gateway} sends each route to its own stateless function on {fn}, and both use {document}."],
      microservices: ["Microservices", "Each service owns its data", "{gateway} routes each request to its service. The orders and users services run separately on {app}, are deployed independently and each owns its database in {sql}."],
      async: ["Async API", "Accept now, deliver the result later", "POST /jobs returns 202 Accepted at once, and the API on {app} puts the job in {queue}. A worker on {fn} processes it and saves the result in {document}, which the client checks later with a GET request."],
    },
    roles: {
      extract: "Extract", transform: "Transform", load: "Load", result: "Result",
      producer: "Producer", bus: "Event bus", consumer: "Consumer",
      stream: "Event stream", processing: "Processing", output: "Output",
      ingestion: "Ingestion", facts: "Facts", dimension: "Dimension", query: "Query",
      raw: "Raw data", cleaned: "Cleaned data", business: "Business-ready",
      client: "Client", gateway: "Gateway", restApi: "REST API", database: "Database", module: "Module",
      http: "HTTP", rules: "Business rules", dataAccess: "Data access",
      get: "GET /orders", post: "POST /orders", nosql: "NoSQL database",
      service: "Service", ownDb: "Own database", api: "API", queue: "Queue", worker: "Worker", jobStatus: "Job status",
    },
    labels: {
      rawTables: "Raw tables", curatedTables: "Curated tables", application: "Application",
      sourceData: "Source data", sales: "Sales", product: "Product", customer: "Customer", date: "Date",
      dashboards: "BI dashboards", bronze: "Bronze", silver: "Silver", gold: "Gold",
      webApp: "Web app", orders: "Orders", users: "Users", catalog: "Catalog",
      controller: "Controller", service: "Service", repository: "Repository",
    },
    groups: {
      lake: "{storage}, {formatShort} tables",
      oneDeployment: "{app}, one deployment",
      oneApp: "{app}, one application",
      ordersDomain: "Orders",
      usersDomain: "Users",
    },
  },
  es: {
    families: { data: "Ingeniería de datos", software: "Ingeniería de software" },
    title: "{pattern} · {cloud}",
    lead: "Esquema ilustrativo.",
    patterns: {
      etl: ["ETL", "Transformar antes de cargar", "{storage} recibe los archivos de origen, {pipeline} los transforma y el resultado se carga en {warehouse}."],
      elt: ["ELT", "Cargar primero y transformar en el data warehouse", "{storage} guarda los archivos de origen. Se cargan sin cambios en tablas crudas de {warehouse}, donde {dialect} las convierte en tablas curadas."],
      events: ["Basado en eventos", "Un bus desacopla productores y consumidores", "Una aplicación publica cada evento en {events}, que entrega una copia a dos consumidores independientes en {fn}. El productor no sabe quién lee sus eventos."],
      streaming: ["Streaming", "Eventos continuos, procesados por ventanas de tiempo", "Los eventos llegan de forma continua a {stream}. {streamProc} los agrupa en ventanas de tiempo y escribe el resultado de cada ventana en {sink}."],
      warehouse: ["Data warehouse", "Un modelo estrella para consultas analíticas", "Los datos se cargan en un modelo estrella en {warehouse}, con una tabla de hechos de ventas unida a las dimensiones de producto, cliente y fecha. Los tableros de BI consultan el modelo."],
      lakehouse: ["Lakehouse", "Capas de tablas sobre almacenamiento de objetos", "Tablas {format} sobre {storage}, en tres capas. Bronce guarda los datos crudos, plata los datos depurados y oro los datos listos para el negocio, y {spark} procesa cada paso."],
      rest: ["API REST", "Solicitud, consulta y respuesta JSON", "El cliente envía la solicitud GET /orders a {gateway}, que la dirige a la API en {app}. La API consulta {sql} y la respuesta JSON vuelve por el mismo camino."],
      modular: ["Monolito modular", "Módulos con interfaces internas y un solo despliegue", "Una sola aplicación en {app}, desplegada como una unidad. El módulo de pedidos llama a los módulos de usuarios y catálogo mediante interfaces internas, y cada uno de esos módulos mantiene sus propias tablas en {sql}."],
      layers: ["API por capas", "Controlador, servicio y repositorio", "Una solicitud pasa por tres capas de una aplicación en {app}. El controlador atiende HTTP, el servicio aplica las reglas de negocio y el repositorio consulta {sql}. El resultado vuelve capa por capa como JSON."],
      serverless: ["API serverless", "Una función por ruta", "Dos rutas independientes, donde GET /orders lee y POST /orders escribe. {gateway} envía cada ruta a su propia función sin estado en {fn}, y ambas usan {document}."],
      microservices: ["Microservicios", "Cada servicio con sus propios datos", "{gateway} dirige cada solicitud a su servicio. Los servicios de pedidos y de usuarios corren por separado en {app}, se despliegan de forma independiente y cada uno tiene su propia base de datos en {sql}."],
      async: ["API asíncrona", "Aceptar ahora y entregar el resultado después", "POST /jobs responde 202 Accepted de inmediato, y la API en {app} deja el trabajo en {queue}. Un worker en {fn} lo procesa y guarda el resultado en {document}, que el cliente consulta después con una solicitud GET."],
    },
    roles: {
      extract: "Extracción", transform: "Transformación", load: "Carga", result: "Resultado",
      producer: "Productor", bus: "Bus de eventos", consumer: "Consumidor",
      stream: "Flujo de eventos", processing: "Procesamiento", output: "Salida",
      ingestion: "Ingesta", facts: "Hechos", dimension: "Dimensión", query: "Consulta",
      raw: "Datos crudos", cleaned: "Datos depurados", business: "Listos para el negocio",
      client: "Cliente", gateway: "Gateway", restApi: "API REST", database: "Base de datos", module: "Módulo",
      http: "HTTP", rules: "Reglas de negocio", dataAccess: "Acceso a datos",
      get: "GET /orders", post: "POST /orders", nosql: "Base de datos NoSQL",
      service: "Servicio", ownDb: "Base de datos propia", api: "API", queue: "Cola", worker: "Worker", jobStatus: "Estado del trabajo",
    },
    labels: {
      rawTables: "Tablas crudas", curatedTables: "Tablas curadas", application: "Aplicación",
      sourceData: "Datos de origen", sales: "Ventas", product: "Producto", customer: "Cliente", date: "Fecha",
      dashboards: "Tableros de BI", bronze: "Bronce", silver: "Plata", gold: "Oro",
      webApp: "App web", orders: "Pedidos", users: "Usuarios", catalog: "Catálogo",
      controller: "Controlador", service: "Servicio", repository: "Repositorio",
    },
    groups: {
      lake: "{storage}, tablas {formatShort}",
      oneDeployment: "{app}, un solo despliegue",
      oneApp: "{app}, una aplicación",
      ordersDomain: "Pedidos",
      usersDomain: "Usuarios",
    },
  },
};

/* ---------- Patterns ----------
   Node: s = service key (icon tile, label = the cloud's short name); g = generic glyph with label key l;
   z = zone with that many stacked layers (label l on the plate); r = role key; in = group id.
   Link: a, b, go = steps of the packets from a to b, back = steps of the packets from b to a,
   kind "relation" (no packets, no arrow, straight) or "control" (dashed, no packets).
   Layouts: at = { id: [x, y, labels?] }; labels: "split" (role above, name below; the wide default),
   "right" (the narrow default), "up" (both above), "below" (both below). via = { "a-b": waypoints },
   ports = { "a-b": [portA, portB] } with l, r, t (tile top), b (under the plate). */
const n = (id, s, r, more = {}) => ({ id, s, r, ...more });
const gn = (id, g, l, r, more = {}) => ({ id, g, l, r, ...more });

export const PATTERNS = {
  etl: {
    nodes: [n("src", "storage", "extract"), n("tf", "pipeline", "transform"), n("wh", "warehouse", "load")],
    links: [{ a: "src", b: "tf", go: [0] }, { a: "tf", b: "wh", go: [1] }],
    wide: { at: { src: [110, 100], tf: [320, 100], wh: [530, 100] } },
    narrow: { at: { src: [78, 50], tf: [78, 182], wh: [78, 314] } },
  },
  elt: {
    nodes: [
      n("src", "storage", "extract"),
      gn("raw", "table", "rawTables", "load", { in: "wh" }),
      gn("sql", "code", "dialect", "transform", { in: "wh" }),
      gn("cur", "table", "curatedTables", "result", { in: "wh" }),
    ],
    groups: [{ id: "wh", s: "warehouse" }],
    links: [{ a: "src", b: "raw", go: [0] }, { a: "raw", b: "sql", go: [1] }, { a: "sql", b: "cur", go: [2] }],
    wide: { size: 0.85, at: { src: [76, 130], raw: [238, 130], sql: [398, 130], cur: [558, 130] } },
    narrow: { at: { src: [78, 50], raw: [78, 204], sql: [78, 336], cur: [78, 468] }, label: { wh: { x: 96, full: true } } },
  },
  events: {
    nodes: [gn("app", "app", "application", "producer"), n("bus", "events", "bus"), n("c1", "fn", "consumer"), n("c2", "fn", "consumer")],
    links: [{ a: "app", b: "bus", go: [0] }, { a: "bus", b: "c1", go: [1] }, { a: "bus", b: "c2", go: [1] }],
    wide: { at: { app: [96, 182], bus: [310, 182], c1: [530, 92], c2: [530, 272] } },
    narrow: {
      at: { app: [78, 50], bus: [78, 182], c1: [78, 338, "below"], c2: [224, 338, "below"] },
      ports: { "bus-c1": ["b", "t"], "bus-c2": ["b", "t"] },
    },
  },
  streaming: {
    nodes: [n("in", "stream", "stream"), n("proc", "streamProc", "processing"), n("out", "sink", "output")],
    links: [{ a: "in", b: "proc", go: [0], burst: 3 }, { a: "proc", b: "out", go: [1] }],
    wide: { at: { in: [110, 100], proc: [320, 100], out: [530, 100] } },
    narrow: { at: { in: [78, 50], proc: [78, 182], out: [78, 314] } },
  },
  warehouse: {
    nodes: [
      gn("src", "table", "sourceData", "ingestion"),
      gn("fact", "table", "sales", "facts", { in: "wh" }),
      gn("d1", "table", "product", "dimension", { in: "wh", size: 0.8 }),
      gn("d2", "table", "customer", "dimension", { in: "wh", size: 0.8 }),
      gn("d3", "table", "date", "dimension", { in: "wh", size: 0.8 }),
      gn("bi", "chart", "dashboards", "query"),
    ],
    groups: [{ id: "wh", s: "warehouse" }],
    links: [
      { a: "src", b: "fact", go: [0] },
      { a: "fact", b: "d1", kind: "relation" },
      { a: "fact", b: "d2", kind: "relation" },
      { a: "fact", b: "d3", kind: "relation" },
      { a: "fact", b: "bi", go: [1] },
    ],
    wide: {
      at: { src: [84, 122], fact: [300, 214, "up"], d1: [466, 128, "right"], d2: [466, 214, "right"], d3: [466, 300, "right"], bi: [84, 318] },
      ports: { "src-fact": ["r", "l"], "fact-d1": ["r", "l"], "fact-d2": ["r", "l"], "fact-d3": ["r", "l"], "fact-bi": ["b", "r"] },
    },
    narrow: {
      at: { src: [78, 50], fact: [78, 206], d1: [52, 344, "below"], d2: [150, 344, "below"], d3: [248, 344, "below"], bi: [78, 488] },
      ports: { "fact-d1": ["b", "t"], "fact-d2": ["b", "t"], "fact-d3": ["b", "t"], "fact-bi": ["l", "l"] },
      via: { "fact-bi": [{ x: 10 }, { y: 488 }] },
      label: { wh: { x: 96, full: true } },
    },
  },
  lakehouse: {
    nodes: [
      { id: "bronze", z: 1, l: "bronze", r: "raw", in: "lake" },
      { id: "silver", z: 2, l: "silver", r: "cleaned", in: "lake" },
      { id: "gold", z: 3, l: "gold", r: "business", in: "lake" },
      n("engine", "spark", "processing"),
    ],
    groups: [{ id: "lake", s: "storage", l: "lake" }],
    links: [
      { a: "bronze", b: "silver", go: [0] },
      { a: "silver", b: "gold", go: [1] },
      { a: "engine", b: "bronze", kind: "control" },
      { a: "engine", b: "silver", kind: "control" },
      { a: "engine", b: "gold", kind: "control" },
    ],
    wide: {
      at: { bronze: [102, 176], silver: [296, 176], gold: [490, 176], engine: [566, 336] },
      ports: { "engine-bronze": ["l", "b"], "engine-silver": ["l", "b"], "engine-gold": ["l", "b"] },
    },
    narrow: {
      at: { bronze: [98, 92], silver: [98, 230], gold: [98, 377], engine: [78, 523] },
      ports: { "bronze-silver": ["b", "t"], "silver-gold": ["b", "t"], "engine-bronze": ["l", "l"], "engine-silver": ["l", "l"], "engine-gold": ["l", "l"] },
      via: { "engine-bronze": [{ x: 14 }, { y: 92 }], "engine-silver": [{ x: 14 }, { y: 230 }], "engine-gold": [{ x: 14 }, { y: 377 }] },
      label: { lake: { full: true } },
    },
  },
  rest: {
    nodes: [gn("client", "app", "webApp", "client"), n("gw", "gateway", "gateway"), n("api", "app", "restApi"), n("db", "sql", "database")],
    links: [{ a: "client", b: "gw", go: [0], back: [5] }, { a: "gw", b: "api", go: [1], back: [4] }, { a: "api", b: "db", go: [2], back: [3] }],
    wide: { size: 0.85, at: { client: [76, 100], gw: [238, 100], api: [400, 100], db: [562, 100] } },
    narrow: { at: { client: [78, 50], gw: [78, 182], api: [78, 314], db: [78, 446] } },
  },
  modular: {
    nodes: [
      gn("client", "app", "webApp", "client"),
      gn("orders", "code", "orders", "module", { in: "app" }),
      gn("users", "code", "users", "module", { in: "app" }),
      gn("catalog", "code", "catalog", "module", { in: "app" }),
      n("db", "sql", "database"),
    ],
    groups: [{ id: "app", s: "app", l: "oneDeployment" }],
    links: [
      { a: "client", b: "orders", go: [0], back: [5] },
      { a: "orders", b: "users", go: [1], back: [4] },
      { a: "orders", b: "catalog", go: [1], back: [4] },
      { a: "users", b: "db", go: [2], back: [3] },
      { a: "catalog", b: "db", go: [2], back: [3] },
    ],
    wide: { at: { client: [66, 222], orders: [246, 222], users: [414, 126], catalog: [414, 318], db: [578, 222] } },
    narrow: {
      at: { client: [96, 50], orders: [96, 186], users: [76, 328, "below", 120], catalog: [224, 328, "below", 120], db: [150, 524, "below"] },
      ports: { "orders-users": ["b", "t"], "orders-catalog": ["b", "t"], "users-db": ["l", "l"], "catalog-db": ["r", "r"] },
      via: { "users-db": [{ x: 10 }, { y: 524 }], "catalog-db": [{ x: 290 }, { y: 524 }] },
      label: { app: { at: "bottom", full: true } },
    },
  },
  layers: {
    nodes: [
      gn("client", "app", "webApp", "client"),
      gn("ctrl", "code", "controller", "http", { in: "app" }),
      gn("svc", "code", "service", "rules", { in: "app" }),
      gn("repo", "code", "repository", "dataAccess", { in: "app" }),
      n("db", "sql", "database"),
    ],
    groups: [{ id: "app", s: "app", l: "oneApp" }],
    links: [
      { a: "client", b: "ctrl", go: [0], back: [7] },
      { a: "ctrl", b: "svc", go: [1], back: [6] },
      { a: "svc", b: "repo", go: [2], back: [5] },
      { a: "repo", b: "db", go: [3], back: [4] },
    ],
    wide: { size: 0.62, at: { client: [54, 130], ctrl: [186, 130], svc: [318, 130], repo: [450, 130], db: [582, 130] } },
    narrow: { at: { client: [78, 50], ctrl: [78, 214], svc: [78, 346], repo: [78, 478], db: [78, 618] }, label: { app: { x: 96, full: true } } },
  },
  serverless: {
    nodes: [
      gn("client", "app", "webApp", "client"),
      n("gw", "gateway", "gateway"),
      n("get", "fn", "get"),
      n("post", "fn", "post"),
      n("db", "document", "nosql"),
    ],
    links: [
      { a: "client", b: "gw", go: [0, 1], back: [5, 6] },
      { a: "gw", b: "get", go: [1], back: [4] },
      { a: "gw", b: "post", go: [2], back: [5] },
      { a: "get", b: "db", go: [2], back: [3] },
      { a: "post", b: "db", go: [3], back: [4] },
    ],
    wide: { at: { client: [64, 190], gw: [244, 190], get: [404, 96], post: [404, 284], db: [568, 190] } },
    narrow: {
      at: { client: [96, 50], gw: [96, 182], get: [76, 326, "below", 120], post: [224, 326, "below", 120], db: [150, 492, "below"] },
      ports: { "gw-get": ["b", "t"], "gw-post": ["b", "t"], "get-db": ["l", "l"], "post-db": ["r", "r"] },
      via: { "get-db": [{ x: 10 }, { y: 492 }], "post-db": [{ x: 290 }, { y: 492 }] },
    },
  },
  microservices: {
    nodes: [
      gn("client", "app", "webApp", "client"),
      n("gw", "gateway", "gateway"),
      n("orders", "app", "service", { in: "d1" }),
      n("odb", "sql", "ownDb", { in: "d1" }),
      n("users", "app", "service", { in: "d2" }),
      n("udb", "sql", "ownDb", { in: "d2" }),
    ],
    groups: [{ id: "d1", l: "ordersDomain" }, { id: "d2", l: "usersDomain" }],
    links: [
      { a: "client", b: "gw", go: [0], back: [5] },
      { a: "gw", b: "orders", go: [1], back: [4] },
      { a: "gw", b: "users", go: [1], back: [4] },
      { a: "orders", b: "odb", go: [2], back: [3] },
      { a: "users", b: "udb", go: [2], back: [3] },
    ],
    wide: { size: 0.85, at: { client: [62, 240], gw: [222, 240], orders: [392, 128], odb: [566, 128], users: [392, 352], udb: [566, 352] } },
    narrow: {
      at: { client: [96, 50], gw: [96, 182], orders: [76, 356, "below", 120], odb: [76, 542, "below", 120], users: [224, 356, "below", 120], udb: [224, 542, "below", 120] },
      ports: { "gw-orders": ["b", "t"], "gw-users": ["b", "t"], "orders-odb": ["l", "l"], "users-udb": ["r", "r"] },
      via: { "orders-odb": [{ x: 12 }, { y: 542 }], "users-udb": [{ x: 288 }, { y: 542 }] },
      label: { d1: { at: "bottom" }, d2: { at: "bottom" } },
    },
  },
  async: {
    nodes: [
      gn("client", "app", "webApp", "client"),
      n("api", "app", "api"),
      n("queue", "queue", "queue"),
      n("worker", "fn", "worker"),
      n("store", "document", "jobStatus"),
    ],
    links: [
      { a: "client", b: "api", go: [0, 4], back: [1, 7] },
      { a: "api", b: "queue", go: [1] },
      { a: "queue", b: "worker", go: [2] },
      { a: "worker", b: "store", go: [3] },
      { a: "api", b: "store", go: [5], back: [6] },
    ],
    wide: {
      size: 0.85,
      at: { client: [70, 122, "up"], api: [232, 122, "up"], queue: [394, 122, "up"], worker: [556, 122, "up"], store: [394, 300] },
      ports: { "worker-store": ["b", "r"], "api-store": ["b", "l"] },
    },
    narrow: {
      at: { client: [86, 50], api: [86, 182], queue: [86, 314], worker: [86, 446], store: [86, 578] },
      ports: { "api-store": ["l", "l"] },
      via: { "api-store": [{ x: 14 }, { y: 578 }] },
    },
  },
};

/* ---------- Geometry ---------- */
// Wide shows when the stage is at least 600 px wide and narrow at 288 px or more, so 15-unit text never renders under 14 px.
const GEOM = {
  wide: { W: 640, hw: 60, hh: 30, t: 11, tile: 46, role: 15, name: 16, line: 18, wrap: 150, labels: "split", zone: 68 },
  narrow: { W: 300, hw: 50, hh: 25, t: 9, tile: 38, role: 15, name: 16, line: 18, wrap: 170, labels: "right", zone: 62 },
};
const GAP = 4;
const ARROW = 8;
const PAD = 12;
const BAND = 30; // group label row

// Width of a label in Archivo, from glyph classes measured at 600 weight (1 em = 1).
function textWidth(text, size) {
  let w = 0;
  for (const ch of text) {
    if (ch === " ") w += 0.21;
    else if ("ijlíI.,:;'".includes(ch)) w += 0.26;
    else if ("ft/-()r".includes(ch)) w += 0.34;
    else if ("mwMW".includes(ch)) w += 0.88;
    else if (ch !== ch.toLowerCase()) w += 0.71;
    else w += 0.57;
  }
  return w * size;
}

// One or two lines: a label wider than `max` breaks at the space nearest its middle.
function wrap(text, size, max) {
  if (textWidth(text, size) <= max || !text.includes(" ")) return [text];
  const mid = text.length / 2;
  let at = -1;
  for (let i = 0; i < text.length; i++) if (text[i] === " " && (at < 0 || Math.abs(i - mid) < Math.abs(at - mid))) at = i;
  return [text.slice(0, at), text.slice(at + 1)];
}

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

/** Names, title and description of one selection, in one language. */
export function describe({ cloud, pattern }, locale) {
  const t = TEXT[locale];
  const c = CLOUDS[cloud];
  const vars = { format: c.format, formatShort: c.formatShort, dialect: c.dialect, sink: c.services[c.sink].full };
  for (const [key, s] of Object.entries(c.services)) vars[key] = s.full;
  const [label, summary, desc] = t.patterns[pattern];
  return { label, summary, desc: fill(desc, vars), title: fill(t.title, { pattern: label, cloud: c.name }), lead: t.lead };
}

/** Everything the SVG needs for one selection and one layout: nodes, links and groups with coordinates. */
export function scene({ cloud, pattern }, locale, layout) {
  const t = TEXT[locale];
  const c = CLOUDS[cloud];
  const p = PATTERNS[pattern];
  const L = p[layout];
  const G = GEOM[layout];
  const shortVars = { app: c.services.app.short, storage: c.services.storage.short, formatShort: c.formatShort };

  const nodes = p.nodes.map((spec) => {
    const [x, y, mode = G.labels, wrapAt] = L.at[spec.id];
    const k = spec.size ?? L.size ?? 1;
    const key = spec.s === "sink" ? c.sink : spec.s;
    const service = key ? c.services[key] : null;
    const zone = spec.z ?? 0;
    const hw = (zone ? G.zone : G.hw) * k;
    const node = {
      id: spec.id, x, y, mode, zone, group: spec.in,
      hw, hh: hw / 2, t: G.t, lift: zone ? (zone - 1) * G.t : 0,
      tile: zone ? 0 : Math.round(G.tile * Math.min(1, k + 0.1)),
      icon: service?.icon ?? null, glyph: spec.g ?? null,
      name: service ? service.short : spec.l === "dialect" ? c.dialect : t.labels[spec.l],
      role: spec.r ? t.roles[spec.r] : "",
    };
    // Text may use the room the node has: up to the edge for side labels, around its center otherwise.
    const room = mode === "right" ? G.W - (x + hw + 12) - 4 : 2 * Math.min(x, G.W - x) - 8;
    return placeLabels({ ...node, wrap: Math.min(wrapAt ?? G.wrap, room) }, G);
  });
  const byId = Object.fromEntries(nodes.map((nd) => [nd.id, nd]));

  const links = p.links.map((lk) => {
    const key = `${lk.a}-${lk.b}`;
    const A = byId[lk.a];
    const B = byId[lk.b];
    const pts = lk.kind === "relation" && !L.ports?.[key] ? spoke(A, B) : route(A, B, L.ports?.[key], L.via?.[key]);
    return { ...lk, key, pts, arrow: lk.kind !== "relation" };
  });

  // The label row sits on top, or at the bottom where a link enters the group from above (layout `label`).
  const groups = (p.groups ?? []).map((g) => {
    const members = nodes.filter((nd) => nd.group === g.id);
    let box = members.reduce((b, nd) => union(b, nd.box), null);
    // A link between two members stays inside the border, clear of it (narrow microservices).
    for (const lk of links)
      if (byId[lk.a].group === g.id && byId[lk.b].group === g.id) for (const [x, y] of lk.pts) box = union(box, { x, y, w: 0, h: 0 });
    const where = L.label?.[g.id] ?? {};
    const x = where.full ? 4 : Math.max(4, box.x - PAD);
    const right = where.full ? G.W - 4 : Math.min(G.W - 4, box.x + box.w + PAD);
    const label = g.l ? fill(t.groups[g.l], shortVars) : c.services[g.s].short;
    const icon = g.s ? c.services[g.s].icon : null;
    const lx = where.x ?? x + 12;
    const tx = lx + (icon ? 28 : 0);
    const lines = wrap(label, 15, right - 8 - tx);
    const band = BAND + (lines.length - 1) * G.line;
    const y = where.at === "bottom" ? box.y - PAD : box.y - PAD - band;
    const h = box.h + 2 * PAD + band;
    const row = where.at === "bottom" ? y + h - band : y;
    const texts = lines.map((s, i) => ({ s, x: tx, y: row + 21 + i * G.line, size: 15, box: { x: tx, y: row + 9.6 + i * G.line, w: textWidth(s, 15), h: 14.7 } }));
    return { id: g.id, label, icon, x, y, w: right - x, h, lx, row, texts };
  });

  // The viewBox ends under the lowest drawing.
  let bottom = 0;
  for (const nd of nodes) bottom = Math.max(bottom, nd.box.y + nd.box.h);
  for (const g of groups) bottom = Math.max(bottom, g.y + g.h);
  for (const lk of links) for (const [, py] of lk.pts) bottom = Math.max(bottom, py);
  const H = Math.ceil(bottom + PAD);
  const natural = [0, 0, G.W, H];
  return { layout, W: G.W, H, natural, nodes, links, groups };
}

function union(a, b) {
  if (!a) return { ...b };
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

// Label lines and their boxes; `box` is the whole node (plate, tile and labels) for groups and checks.
function placeLabels(nd, G) {
  const { x, y, hw, hh, t, lift, tile, mode } = nd;
  const top = y - lift - hh - (tile ? tile + 2 - hh : 0); // highest point of plate or tile
  const bottom = y + hh + t;
  const roleLines = nd.role ? wrap(nd.role, G.role, nd.wrap) : [];
  const nameLines = nd.zone ? [] : wrap(nd.name, G.name, nd.wrap);
  const texts = [];
  const add = (lines, cls, size, ax, firstBaseline, anchor) =>
    lines.forEach((s, i) => texts.push({ s, cls, size, x: ax, y: firstBaseline + i * G.line, anchor }));
  const roleH = roleLines.length * G.line;
  const nameH = nameLines.length * G.line;
  if (mode === "right") {
    const lx = x + hw + 12;
    const first = y - 3 - (roleH + nameH) / 2 + 13;
    add(roleLines, "ax-role", G.role, lx, first, "start");
    add(nameLines, "ax-name", G.name, lx, first + roleH, "start");
  } else if (mode === "up") {
    const nameFirst = top - 10 - (nameLines.length - 1) * G.line;
    add(nameLines, "ax-name", G.name, x, nameFirst, "middle");
    add(roleLines, "ax-role", G.role, x, nameFirst - roleH, "middle");
  } else if (mode === "below") {
    add(roleLines, "ax-role", G.role, x, bottom + 19, "middle");
    add(nameLines, "ax-name", G.name, x, bottom + 19 + roleH, "middle");
  } else {
    add(roleLines, "ax-role", G.role, x, top - 10 - (roleLines.length - 1) * G.line, "middle");
    add(nameLines, "ax-name", G.name, x, bottom + 20, "middle");
  }
  if (nd.zone) texts.push({ s: nd.name, cls: "ax-zone", size: G.name, x, y: y - lift + 6, anchor: "middle" });
  let box = { x: x - hw, y: top, w: 2 * hw, h: bottom - top };
  for (const tx of texts) {
    const w = textWidth(tx.s, tx.size);
    const left = tx.anchor === "middle" ? tx.x - w / 2 : tx.x;
    tx.box = { x: left, y: tx.y - tx.size * 0.76, w, h: tx.size * 0.98 };
    box = union(box, tx.box);
  }
  return { ...nd, texts, box, tileTop: tile ? y - tile - 2 : y - lift - hh };
}

const PORT = { l: [-1, 0], r: [1, 0], t: [0, -1], b: [0, 1] };
function portAt(nd, side) {
  if (side === "l") return [nd.x - nd.hw, nd.y];
  if (side === "r") return [nd.x + nd.hw, nd.y];
  if (side === "b") return [nd.x, nd.y + nd.hh + nd.t];
  return [nd.x, nd.tileTop];
}

// Orthogonal route between two ports: straight, one bend (L) or two (Z), unless waypoints say otherwise.
function route(A, B, ports, via) {
  let [pa, pb] = ports ?? [];
  if (!pa) {
    if (Math.abs(A.y - B.y) < 1 || Math.abs(A.x - B.x) > 1) [pa, pb] = B.x >= A.x ? ["r", "l"] : ["l", "r"];
    else [pa, pb] = B.y > A.y ? ["b", "t"] : ["t", "b"];
  }
  const P = portAt(A, pa);
  const Q = portAt(B, pb);
  const pts = [P];
  if (via) {
    let cur = P;
    for (const v of via) {
      cur = [v.x ?? cur[0], v.y ?? cur[1]];
      pts.push(cur);
    }
  } else if (PORT[pa][0] && PORT[pb][0]) {
    if (Math.abs(P[1] - Q[1]) > 0.5) { const xm = (P[0] + Q[0]) / 2; pts.push([xm, P[1]], [xm, Q[1]]); }
  } else if (PORT[pa][1] && PORT[pb][1]) {
    if (Math.abs(P[0] - Q[0]) > 0.5) { const ym = (P[1] + Q[1]) / 2; pts.push([P[0], ym], [Q[0], ym]); }
  } else if (PORT[pa][0]) pts.push([Q[0], P[1]]);
  else pts.push([P[0], Q[1]]);
  pts.push(Q);
  return trim(pts);
}

// Straight spoke between two plates (star schema), from edge to edge.
function spoke(A, B) {
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const reach = (nd) => 1 / (Math.abs(ux) / nd.hw + Math.abs(uy) / nd.hh) + GAP + 2;
  const a = reach(A);
  const b = reach(B);
  return [[A.x + ux * a, A.y + uy * a], [B.x - ux * b, B.y - uy * b]];
}

// Leaves a small gap at both ends; the arrowhead tip sits at the end gap.
function trim(pts) {
  const out = pts.map((p) => [...p]);
  const step = (from, to, d) => {
    const len = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
    return [from[0] + ((to[0] - from[0]) / len) * d, from[1] + ((to[1] - from[1]) / len) * d];
  };
  out[0] = step(out[0], out[1], GAP);
  out[out.length - 1] = step(out[out.length - 1], out[out.length - 2], GAP);
  return out.filter((p, i) => i === 0 || Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1]) > 0.1);
}

/** SVG path through the points with rounded corners (packets follow the same curve). `end` leaves room for the arrowhead. */
export function pathOf(pts, end = 0) {
  const radius = 10;
  const p = pts.map((q) => [...q]);
  if (end) {
    const [a, b] = [p[p.length - 2], p[p.length - 1]];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const k = Math.max(0, len - end) / len;
    p[p.length - 1] = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }
  const f = (v) => Math.round(v * 10) / 10;
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
    const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const p1 = [b[0] - ((b[0] - a[0]) / l1) * r, b[1] - ((b[1] - a[1]) / l1) * r];
    const p2 = [b[0] + ((c[0] - b[0]) / l2) * r, b[1] + ((c[1] - b[1]) / l2) * r];
    d += `L${f(p1[0])} ${f(p1[1])}Q${f(b[0])} ${f(b[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  const z = p[p.length - 1];
  return `${d}L${f(z[0])} ${f(z[1])}`;
}

/* ---------- Markup ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
const r1 = (v) => Math.round(v * 10) / 10;

const GLYPHS = {
  table: "M4 5h16v14H4zM4 9.5h16M4 14h16M10 5v14",
  app: "M3 5h18v14H3zM3 9h18",
  chart: "M4 19.5h16M7 17v-5M12 17V8M17 17v-7",
  code: "M9 5C7 5 7 6 7 8v2.5C7 11.5 6 12 5 12c1 0 2 .5 2 1.5V16c0 2 0 3 2 3M15 5c2 0 2 1 2 3v2.5c0 1 1 1.5 2 1.5-1 0-2 .5-2 1.5V16c0 2 0 3-2 3",
};

function slab(x, y, hw, hh, t) {
  const top = `M${r1(x - hw)} ${r1(y)}L${r1(x)} ${r1(y - hh)}L${r1(x + hw)} ${r1(y)}L${r1(x)} ${r1(y + hh)}Z`;
  const left = `M${r1(x - hw)} ${r1(y)}L${r1(x)} ${r1(y + hh)}V${r1(y + hh + t)}L${r1(x - hw)} ${r1(y + t)}Z`;
  const right = `M${r1(x)} ${r1(y + hh)}L${r1(x + hw)} ${r1(y)}V${r1(y + t)}L${r1(x)} ${r1(y + hh + t)}Z`;
  return `<path class="ax-side-l" d="${left}"/><path class="ax-side-r" d="${right}"/><path class="ax-top" d="${top}"/>`;
}

function nodeMarkup(nd) {
  const { x, y, hw, hh, t, zone, tile } = nd;
  let body = "";
  const layers = Math.max(1, zone);
  for (let k = 0; k < layers; k++) body += slab(x, y - k * t, hw, hh, t);
  body += `<path class="ax-hit" d="M${r1(x - hw)} ${r1(y - nd.lift)}L${r1(x)} ${r1(y - nd.lift - hh)}L${r1(x + hw)} ${r1(y - nd.lift)}L${r1(x)} ${r1(y - nd.lift + hh)}Z"/>`;
  if (tile) {
    const tx = x - tile / 2;
    const ty = y - tile - 2;
    const inner = Math.round(tile * 0.7);
    if (nd.icon) {
      body += `<rect class="ax-tile" x="${r1(tx)}" y="${r1(ty)}" width="${tile}" height="${tile}"/>`;
      body += `<image href="${nd.icon}" x="${r1(x - inner / 2)}" y="${r1(ty + (tile - inner) / 2)}" width="${inner}" height="${inner}"/>`;
    } else {
      const s = inner / 24;
      body += `<rect class="ax-tile ax-tile--own" x="${r1(tx)}" y="${r1(ty)}" width="${tile}" height="${tile}"/>`;
      body += `<path class="ax-glyph" transform="translate(${r1(x - 12 * s)} ${r1(ty + (tile - inner) / 2)}) scale(${r1(s * 100) / 100})" d="${GLYPHS[nd.glyph]}"/>`;
    }
  }
  let text = "";
  for (const tx of nd.texts) {
    const el = `<text class="${tx.cls}" x="${r1(tx.x)}" y="${r1(tx.y)}" font-size="${tx.size}" text-anchor="${tx.anchor}">${esc(tx.s)}</text>`;
    if (tx.cls === "ax-zone") body += el;
    else text += el;
  }
  return `<g class="ax-node" data-node="${nd.id}"><g class="ax-body">${body}</g>${text}</g>`;
}

function arrowHead(pts) {
  const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]];
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const ux = (b[0] - a[0]) / len;
  const uy = (b[1] - a[1]) / len;
  const bx = b[0] - ux * ARROW;
  const by = b[1] - uy * ARROW;
  const w = 3.5;
  return `M${r1(b[0])} ${r1(b[1])}L${r1(bx - uy * w)} ${r1(by + ux * w)}L${r1(bx + uy * w)} ${r1(by - ux * w)}Z`;
}

/** Inner markup of the SVG: title, description, groups, links, then nodes. Packets are added by the client. */
export function svgMarkup(sc, ids, text) {
  let out = `<title id="${ids.title}">${esc(text.title)}</title><desc id="${ids.desc}">${esc(`${text.lead} ${text.desc}`)}</desc>`;
  for (const g of sc.groups) {
    out += `<g class="ax-group"><rect class="ax-zonebox" x="${r1(g.x)}" y="${r1(g.y)}" width="${r1(g.w)}" height="${r1(g.h)}"/>`;
    if (g.icon) out += `<rect class="ax-tile" x="${r1(g.lx)}" y="${r1(g.row + 6)}" width="20" height="20"/><image href="${g.icon}" x="${r1(g.lx + 3)}" y="${r1(g.row + 9)}" width="14" height="14"/>`;
    for (const tx of g.texts) out += `<text class="ax-group-label" x="${r1(tx.x)}" y="${r1(tx.y)}" font-size="15">${esc(tx.s)}</text>`;
    out += "</g>";
  }
  for (const lk of sc.links) {
    const cls = `ax-link${lk.kind ? ` ax-link--${lk.kind}` : ""}`;
    out += `<g class="${cls}" data-link="${lk.key}"><path class="ax-line" d="${pathOf(lk.pts, lk.arrow ? ARROW - 1 : 0)}"/>`;
    if (lk.arrow) out += `<path class="ax-arrow" d="${arrowHead(lk.pts)}"/>`;
    out += "</g>";
  }
  out += `<g class="ax-packets"></g>`;
  for (const nd of sc.nodes) out += nodeMarkup(nd);
  return out;
}

/** Packet trips in play order: [{ key, from, to, step, back, burst }]; the client animates them. */
export function trips(sc) {
  const out = [];
  for (const lk of sc.links) {
    for (const step of lk.go ?? []) out.push({ key: lk.key, from: lk.a, to: lk.b, step, back: false, burst: lk.burst ?? 1, pts: lk.pts });
    for (const step of lk.back ?? []) out.push({ key: lk.key, from: lk.b, to: lk.a, step, back: true, burst: 1, pts: [...lk.pts].reverse() });
  }
  return out;
}
