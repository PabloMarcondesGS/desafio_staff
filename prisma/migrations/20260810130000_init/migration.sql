-- Migration: 20260810130000_init
-- Criacao da estrutura do banco de dados relacional para o Sistema de Inspecao Veicular

-- Tabela de Usuarios com Perfis (ADMIN, GESTOR, INSPETOR)
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'INSPETOR',
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Clientes
CREATE TABLE IF NOT EXISTS "clients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "document" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Veiculos
CREATE TABLE IF NOT EXISTS "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "client_id" TEXT,
    "plate" TEXT NOT NULL UNIQUE,
    "model" TEXT NOT NULL,
    "brand" TEXT,
    "year_model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "km" INTEGER NOT NULL DEFAULT 0,
    "chassis" TEXT,
    "renavam" TEXT,
    "fuel_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vehicles_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela de Parametrizacao de Itens do Checklist
CREATE TABLE IF NOT EXISTS "checklist_item_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT 1,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Tabela Principal de Inspecoes
CREATE TABLE IF NOT EXISTS "inspections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "os_number" TEXT NOT NULL UNIQUE,
    "client_id" TEXT NOT NULL,
    "vehicle_id" TEXT NOT NULL,
    "inspector_id" TEXT,
    "consultant_name" TEXT NOT NULL,
    "is_driver_the_scheduler" BOOLEAN NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    
    "fuel_level" REAL NOT NULL DEFAULT 0.5,
    "battery_lev_percent" INTEGER,
    "test_drive_needed" BOOLEAN NOT NULL DEFAULT 0,
    "protective_covers_placed" BOOLEAN NOT NULL DEFAULT 0,
    "warranty_manual_requested" BOOLEAN NOT NULL DEFAULT 0,
    "has_bed" BOOLEAN NOT NULL DEFAULT 0,
    "has_marine_cover" BOOLEAN NOT NULL DEFAULT 0,
    "belongings" TEXT,
    "bodywork_notes" TEXT,
    "tires_notes" TEXT,
    
    "entry_signature" TEXT,
    "entry_date" TEXT,
    "entry_time" TEXT,
    "exit_signature" TEXT,
    "exit_date" TEXT,
    "exit_time" TEXT,
    "terms_accepted" BOOLEAN NOT NULL DEFAULT 1,
    
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspections_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inspections_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Tabela de Respostas do Checklist
CREATE TABLE IF NOT EXISTS "inspection_answers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'S',
    "observation" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_answers_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela de Condicoes de Pneus e Rodas
CREATE TABLE IF NOT EXISTS "tire_wheel_statuses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OK',
    "notes" TEXT,
    CONSTRAINT "tire_wheel_statuses_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela de Marcacoes de Avarias no Blueprint
CREATE TABLE IF NOT EXISTS "damage_markings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "view_type" TEXT NOT NULL,
    "damage_type" TEXT NOT NULL,
    "coord_x" REAL NOT NULL,
    "coord_y" REAL NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "damage_markings_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela de Fotos da Inspecao
CREATE TABLE IF NOT EXISTS "inspection_photos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "inspection_id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'GERAL',
    "file_url" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inspection_photos_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "inspections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indices para otimizacao de busca
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_vehicles_plate" ON "vehicles"("plate");
CREATE INDEX IF NOT EXISTS "idx_inspections_os" ON "inspections"("os_number");
CREATE INDEX IF NOT EXISTS "idx_inspections_status" ON "inspections"("status");
CREATE INDEX IF NOT EXISTS "idx_inspections_client" ON "inspections"("client_id");
CREATE INDEX IF NOT EXISTS "idx_inspections_vehicle" ON "inspections"("vehicle_id");
