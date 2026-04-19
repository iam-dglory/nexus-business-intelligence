-- nexus/backend/prisma/migrations/20240101000000_init/migration.sql
-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "BusinessType" AS ENUM ('B2B', 'B2C', 'HYBRID');
CREATE TYPE "UserRole"     AS ENUM ('USER', 'BUSINESS', 'ADMIN');
CREATE TYPE "ConnectionRole"   AS ENUM ('BUYER', 'SELLER', 'INVESTOR');
CREATE TYPE "ConnectionStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateTable: users
CREATE TABLE "users" (
    "id"           TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "email"        TEXT         NOT NULL,
    "passwordHash" TEXT         NOT NULL,
    "name"         TEXT         NOT NULL,
    "role"         "UserRole"   NOT NULL DEFAULT 'USER',
    "avatarUrl"    TEXT,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable: companies
CREATE TABLE "companies" (
    "id"             TEXT           NOT NULL DEFAULT gen_random_uuid()::text,
    "name"           TEXT           NOT NULL,
    "slug"           TEXT           NOT NULL,
    "description"    TEXT,
    "industry"       TEXT           NOT NULL,
    "businessType"   "BusinessType" NOT NULL,
    "foundedYear"    INTEGER        NOT NULL,
    "employeeCount"  INTEGER,
    "valuation"      BIGINT,
    "valuationLabel" TEXT,
    "growthRate"     DOUBLE PRECISION,
    "website"        TEXT,
    "logoUrl"        TEXT,
    "city"           TEXT           NOT NULL,
    "country"        TEXT           NOT NULL,
    "lat"            DOUBLE PRECISION NOT NULL,
    "lng"            DOUBLE PRECISION NOT NULL,
    "isActive"       BOOLEAN        NOT NULL DEFAULT true,
    "isFeatured"     BOOLEAN        NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3)   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3)   NOT NULL,
    "ownerId"        TEXT,
    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "companies_slug_key"    ON "companies"("slug");
CREATE UNIQUE INDEX "companies_ownerId_key" ON "companies"("ownerId");
CREATE INDEX "companies_industry_key"      ON "companies"("industry");
CREATE INDEX "companies_businessType_key"  ON "companies"("businessType");
CREATE INDEX "companies_foundedYear_key"   ON "companies"("foundedYear");
CREATE INDEX "companies_country_key"       ON "companies"("country");

-- Geography index for PostGIS radius queries
CREATE INDEX "companies_location_idx"
  ON "companies" USING GIST (
    ST_SetSRID(ST_MakePoint("lng", "lat"), 4326)::geography
  );

-- CreateTable: company_updates
CREATE TABLE "company_updates" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "companyId" TEXT         NOT NULL,
    "title"     TEXT         NOT NULL,
    "body"      TEXT,
    "category"  TEXT         NOT NULL DEFAULT 'news',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "company_updates_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "company_updates_companyId_key" ON "company_updates"("companyId");

-- CreateTable: company_tags
CREATE TABLE "company_tags" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "companyId" TEXT NOT NULL,
    "tag"       TEXT NOT NULL,
    CONSTRAINT "company_tags_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "company_tags_companyId_tag_key" ON "company_tags"("companyId", "tag");

-- CreateTable: connections
CREATE TABLE "connections" (
    "id"           TEXT               NOT NULL DEFAULT gen_random_uuid()::text,
    "senderId"     TEXT               NOT NULL,
    "companyId"    TEXT               NOT NULL,
    "role"         "ConnectionRole"   NOT NULL,
    "message"      TEXT,
    "status"       "ConnectionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt"    TIMESTAMP(3)       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3)       NOT NULL,
    "respondedAt"  TIMESTAMP(3),
    "receiverId"   TEXT,
    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "connections_senderId_companyId_key" ON "connections"("senderId", "companyId");
CREATE INDEX "connections_companyId_key" ON "connections"("companyId");
CREATE INDEX "connections_senderId_key"  ON "connections"("senderId");

-- CreateTable: bookmarks
CREATE TABLE "bookmarks" (
    "id"        TEXT         NOT NULL DEFAULT gen_random_uuid()::text,
    "userId"    TEXT         NOT NULL,
    "companyId" TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "bookmarks_userId_companyId_key" ON "bookmarks"("userId", "companyId");

-- Foreign keys
ALTER TABLE "companies"      ADD CONSTRAINT "companies_ownerId_fkey"        FOREIGN KEY ("ownerId")   REFERENCES "users"("id")     ON DELETE SET NULL  ON UPDATE CASCADE;
ALTER TABLE "company_updates" ADD CONSTRAINT "company_updates_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE   ON UPDATE CASCADE;
ALTER TABLE "company_tags"   ADD CONSTRAINT "company_tags_companyId_fkey"   FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE   ON UPDATE CASCADE;
ALTER TABLE "connections"    ADD CONSTRAINT "connections_senderId_fkey"     FOREIGN KEY ("senderId")  REFERENCES "users"("id")     ON DELETE RESTRICT  ON UPDATE CASCADE;
ALTER TABLE "connections"    ADD CONSTRAINT "connections_companyId_fkey"    FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT  ON UPDATE CASCADE;
ALTER TABLE "connections"    ADD CONSTRAINT "connections_receiverId_fkey"   FOREIGN KEY ("receiverId") REFERENCES "users"("id")    ON DELETE SET NULL  ON UPDATE CASCADE;
ALTER TABLE "bookmarks"      ADD CONSTRAINT "bookmarks_userId_fkey"         FOREIGN KEY ("userId")    REFERENCES "users"("id")     ON DELETE RESTRICT  ON UPDATE CASCADE;
ALTER TABLE "bookmarks"      ADD CONSTRAINT "bookmarks_companyId_fkey"      FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT  ON UPDATE CASCADE;
