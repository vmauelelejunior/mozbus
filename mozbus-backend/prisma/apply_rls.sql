-- 🛡️ MOZBUS - SCRIPT DE BLINDAGEM (IRON WALL - RLS)
-- Este script ativa o Row Level Security e cria as políticas de isolamento

-- 1. Ativar RLS em todas as tabelas críticas
ALTER TABLE "Company" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Route" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Trip" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Ticket" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Luggage" ENABLE ROW LEVEL SECURITY;

-- 2. Criar a política para Empresas (Isolamento de Admin de Empresa)
-- Regra: Admins só veem sua própria empresa
CREATE POLICY company_admin_isolation ON "Company"
FOR ALL
USING (
  id::text = current_setting('app.current_company_id', true)
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);

-- 3. Criar a política para Usuários (Funcionários)
CREATE POLICY user_isolation ON "User"
FOR ALL
USING (
  companyId::text = current_setting('app.current_company_id', true)
  OR id::text = current_setting('app.current_user_id', true)
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);

-- 4. Criar a política para Ônibus
CREATE POLICY bus_isolation ON "Bus"
FOR ALL
USING (
  companyId::text = current_setting('app.current_company_id', true)
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);

-- 5. Criar a política para Rotas
CREATE POLICY route_isolation ON "Route"
FOR ALL
USING (
  companyId::text = current_setting('app.current_company_id', true)
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);

-- 6. Criar a política para Viagens (Trips)
CREATE POLICY trip_isolation ON "Trip"
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM "Route" r 
    WHERE r.id = "Trip"."routeId" 
    AND (r."companyId"::text = current_setting('app.current_company_id', true))
  )
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);

-- 7. Criar a política para Passagens (Tickets)
-- Passageiros veem apenas as suas. Admins veem as da empresa.
CREATE POLICY ticket_isolation ON "Ticket"
FOR ALL
USING (
  passengerId::text = current_setting('app.current_user_id', true)
  OR EXISTS (
    SELECT 1 FROM "Trip" t
    JOIN "Route" r ON t."routeId" = r.id
    WHERE t.id = "Ticket"."tripId"
    AND r."companyId"::text = current_setting('app.current_company_id', true)
  )
  OR current_setting('app.user_role', true) = 'SUPER_ADMIN'
);
