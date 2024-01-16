-- -------------------------------------------------------------
-- TablePlus 5.8.4(532)
--
-- https://tableplus.com/
--
-- Database: woofandwiggle
-- Generation Time: 2024-01-16 21:19:31.6500
-- -------------------------------------------------------------


-- This script only contains the table creation statements and does not fully represent the table in the database. It's still missing: indices, triggers. Do not use it as a backup.

-- Sequence and defined type
CREATE SEQUENCE IF NOT EXISTS embeddings_id_seq;

-- Table Definition
CREATE TABLE "public"."embeddings" (
    "id" int4 NOT NULL DEFAULT nextval('embeddings_id_seq'::regclass),
    "embedding" vector,
    "post_title" text,
    "created_at" timestamptz DEFAULT now(),
    "post_guid" text,
    "post_id" int4,
    PRIMARY KEY ("id")
);

