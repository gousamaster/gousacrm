CREATE TYPE "public"."estado_cita" AS ENUM('Programada', 'Completada', 'Cancelada', 'Reprogramada');--> statement-breakpoint
CREATE TYPE "public"."pago_cita_estado" AS ENUM('Pendiente', 'Pagado');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('administrador', 'secretaria');--> statement-breakpoint
CREATE TABLE "cat_estados_pago" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_estado" varchar(255) NOT NULL,
	CONSTRAINT "cat_estados_pago_nombre_estado_unique" UNIQUE("nombre_estado")
);
--> statement-breakpoint
CREATE TABLE "cat_estados_proceso" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_estado" varchar(255) NOT NULL,
	CONSTRAINT "cat_estados_proceso_nombre_estado_unique" UNIQUE("nombre_estado")
);
--> statement-breakpoint
CREATE TABLE "cat_tipos_cita" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_tipo" varchar(255) NOT NULL,
	CONSTRAINT "cat_tipos_cita_nombre_tipo_unique" UNIQUE("nombre_tipo")
);
--> statement-breakpoint
CREATE TABLE "cat_tipos_documento" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_tipo" varchar(255) NOT NULL,
	CONSTRAINT "cat_tipos_documento_nombre_tipo_unique" UNIQUE("nombre_tipo")
);
--> statement-breakpoint
CREATE TABLE "cat_tipos_servicio" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_servicio" varchar(255) NOT NULL,
	CONSTRAINT "cat_tipos_servicio_nombre_servicio_unique" UNIQUE("nombre_servicio")
);
--> statement-breakpoint
CREATE TABLE "cat_tipos_tramite" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_tipo" varchar(255) NOT NULL,
	CONSTRAINT "cat_tipos_tramite_nombre_tipo_unique" UNIQUE("nombre_tipo")
);
--> statement-breakpoint
CREATE TABLE "citas" (
	"id" serial PRIMARY KEY NOT NULL,
	"tramite_id" integer NOT NULL,
	"tipo_cita_id" integer NOT NULL,
	"fecha_hora" timestamp NOT NULL,
	"lugar" varchar(255),
	"costo" numeric(10, 2) DEFAULT '0.00',
	"estado_pago_cita" "pago_cita_estado",
	"estado" "estado_cita",
	"notas" text,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombres" varchar(255) NOT NULL,
	"apellidos" varchar(255) NOT NULL,
	"fecha_nacimiento" date,
	"lugar_nacimiento" varchar(255),
	"numero_ci" varchar(50),
	"numero_pasaporte" varchar(50),
	"pasaporte_fecha_emision" date,
	"pasaporte_fecha_expiracion" date,
	"email" varchar(255),
	"telefono_celular" varchar(50),
	"direccion_domicilio" text,
	"estado_civil" varchar(50),
	"profesion" varchar(255),
	"conyuge_nombre_completo" varchar(255),
	"conyuge_fecha_nacimiento" date,
	"conyuge_lugar_nacimiento" varchar(255),
	"matrimonio_fecha_inicio" date,
	"matrimonio_fecha_fin" date,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp,
	CONSTRAINT "clientes_numero_ci_unique" UNIQUE("numero_ci"),
	CONSTRAINT "clientes_numero_pasaporte_unique" UNIQUE("numero_pasaporte")
);
--> statement-breakpoint
CREATE TABLE "documentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"tramite_id" integer NOT NULL,
	"tipo_documento_id" integer NOT NULL,
	"nombre_documento" varchar(255) NOT NULL,
	"ruta_archivo" varchar(255) NOT NULL,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp
);
--> statement-breakpoint
CREATE TABLE "servicios_complementarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"cliente_id" integer NOT NULL,
	"usuario_responsable_id" uuid,
	"tipo_servicio_id" integer NOT NULL,
	"descripcion" text,
	"fecha_inicio_servicio" date,
	"fecha_fin_servicio" date,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp
);
--> statement-breakpoint
CREATE TABLE "tramite_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"tramite_id" integer NOT NULL,
	"usuario_id" uuid,
	"accion_realizada" text NOT NULL,
	"fecha_accion" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tramites" (
	"id" serial PRIMARY KEY NOT NULL,
	"cliente_id" integer NOT NULL,
	"usuario_asignado_id" uuid,
	"tipo_tramite_id" integer NOT NULL,
	"estado_proceso_id" integer NOT NULL,
	"estado_pago_id" integer NOT NULL,
	"codigo_confirmacion_ds160" varchar(255),
	"codigo_seguimiento_courier" varchar(255),
	"visa_numero" varchar(255),
	"visa_fecha_emision" date,
	"visa_fecha_expiracion" date,
	"notas" text,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nombre_completo" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"rol" "rol" NOT NULL,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"fecha_modificacion" timestamp DEFAULT now() NOT NULL,
	"fecha_eliminacion" timestamp,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_tramite_id_tramites_id_fk" FOREIGN KEY ("tramite_id") REFERENCES "public"."tramites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "citas" ADD CONSTRAINT "citas_tipo_cita_id_cat_tipos_cita_id_fk" FOREIGN KEY ("tipo_cita_id") REFERENCES "public"."cat_tipos_cita"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tramite_id_tramites_id_fk" FOREIGN KEY ("tramite_id") REFERENCES "public"."tramites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_tipo_documento_id_cat_tipos_documento_id_fk" FOREIGN KEY ("tipo_documento_id") REFERENCES "public"."cat_tipos_documento"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios_complementarios" ADD CONSTRAINT "servicios_complementarios_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios_complementarios" ADD CONSTRAINT "servicios_complementarios_usuario_responsable_id_usuarios_id_fk" FOREIGN KEY ("usuario_responsable_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "servicios_complementarios" ADD CONSTRAINT "servicios_complementarios_tipo_servicio_id_cat_tipos_servicio_id_fk" FOREIGN KEY ("tipo_servicio_id") REFERENCES "public"."cat_tipos_servicio"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramite_logs" ADD CONSTRAINT "tramite_logs_tramite_id_tramites_id_fk" FOREIGN KEY ("tramite_id") REFERENCES "public"."tramites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramite_logs" ADD CONSTRAINT "tramite_logs_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_usuario_asignado_id_usuarios_id_fk" FOREIGN KEY ("usuario_asignado_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_tipo_tramite_id_cat_tipos_tramite_id_fk" FOREIGN KEY ("tipo_tramite_id") REFERENCES "public"."cat_tipos_tramite"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_estado_proceso_id_cat_estados_proceso_id_fk" FOREIGN KEY ("estado_proceso_id") REFERENCES "public"."cat_estados_proceso"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tramites" ADD CONSTRAINT "tramites_estado_pago_id_cat_estados_pago_id_fk" FOREIGN KEY ("estado_pago_id") REFERENCES "public"."cat_estados_pago"("id") ON DELETE restrict ON UPDATE no action;