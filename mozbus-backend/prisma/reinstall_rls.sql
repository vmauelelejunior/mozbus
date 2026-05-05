-- REINSTALANDO O MURO DE FERRO (RLS)
-- Garantir que as tabelas operacionais têm RLS ativo
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Route" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;

-- DESATIVANDO RLS NA TABELA USER PARA PERMITIR LOGIN
-- O isolamento de usuários será feito via lógica de serviço (UsersService)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;

-- Remover políticas antigas
DROP POLICY IF EXISTS "company_isolation_policy" ON "Company";
DROP POLICY IF EXISTS "bus_isolation_policy" ON "Bus";
DROP POLICY IF EXISTS "user_isolation_policy" ON "User";
DROP POLICY IF EXISTS "route_isolation_policy" ON "Route";
DROP POLICY IF EXISTS "trip_isolation_policy" ON "Trip";
DROP POLICY IF EXISTS "ticket_isolation_policy" ON "Ticket";

-- 1. Política para Companies
CREATE POLICY "company_isolation_policy" ON "Company"
FOR ALL
USING (
  current_setting('app.user_role', true) = 'SUPER_ADMIN' OR 
  id::text = current_setting('app.current_company_id', true)
);

-- 2. Política para Buses
CREATE POLICY "bus_isolation_policy" ON "Bus"
FOR ALL
USING (
  current_setting('app.user_role', true) = 'SUPER_ADMIN' OR 
  "companyId"::text = current_setting('app.current_company_id', true)
);

-- 4. Política para Routes
CREATE POLICY "route_isolation_policy" ON "Route"
FOR ALL
USING (
  current_setting('app.user_role', true) = 'SUPER_ADMIN' OR 
  "companyId"::text = current_setting('app.current_company_id', true)
);

-- 5. Política para Trips
CREATE POLICY "trip_isolation_policy" ON "Trip"
FOR ALL
USING (
  current_setting('app.user_role', true) = 'SUPER_ADMIN' OR 
  EXISTS (
    SELECT 1 FROM "Route" r 
    WHERE r.id = "Trip"."routeId" AND r."companyId"::text = current_setting('app.current_company_id', true)
  )
);

-- 6. Política para Tickets
CREATE POLICY "ticket_isolation_policy" ON "Ticket"
FOR ALL
USING (
  current_setting('app.user_role', true) = 'SUPER_ADMIN' OR 
  "passengerId"::text = current_setting('app.current_user_id', true) OR
  EXISTS (
    SELECT 1 FROM "Trip" t
    JOIN "Route" r ON r.id = t."routeId"
    WHERE t.id = "Ticket"."tripId" AND r."companyId"::text = current_setting('app.current_company_id', true)
  )
);

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
