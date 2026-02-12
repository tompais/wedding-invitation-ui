-- Initial schema migration from Prisma
-- This creates the database structure for the wedding invitation app

-- CreateTable: groups
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable: guests
CREATE TABLE "guests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20),
    "code" VARCHAR(6) NOT NULL DEFAULT LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0'),
    "group_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable: confirmations
CREATE TABLE "confirmations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "civil_attending" BOOLEAN NOT NULL DEFAULT false,
    "party_attending" BOOLEAN NOT NULL DEFAULT false,
    "guest_id" UUID NOT NULL,
    "confirmed_by_id" UUID NOT NULL,
    "group_id" UUID,
    "confirmed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_name_key" ON "groups"("name");
CREATE INDEX "idx_groups_name" ON "groups"("name");

-- CreateIndex
CREATE UNIQUE INDEX "guests_code_key" ON "guests"("code");
CREATE INDEX "idx_guests_code" ON "guests"("code");
CREATE INDEX "idx_guests_group_id" ON "guests"("group_id");

-- CreateIndex
CREATE INDEX "idx_confirmations_confirmed_by_id" ON "confirmations"("confirmed_by_id");
CREATE INDEX "idx_confirmations_group_id" ON "confirmations"("group_id");
CREATE INDEX "idx_confirmations_confirmed_at" ON "confirmations"("confirmed_at");
CREATE UNIQUE INDEX "confirmations_guest_id_key" ON "confirmations"("guest_id");

-- AddForeignKey
ALTER TABLE "guests" ADD CONSTRAINT "fk_guests_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "fk_confirmations_guest" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "fk_confirmations_confirmed_by" FOREIGN KEY ("confirmed_by_id") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "confirmations" ADD CONSTRAINT "fk_confirmations_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_confirmations_updated_at BEFORE UPDATE ON confirmations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
