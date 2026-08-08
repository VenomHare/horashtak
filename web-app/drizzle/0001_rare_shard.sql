ALTER TABLE "access_requests" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "downloads" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "releases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "access_requests_insert_own" ON "access_requests" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("access_requests"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "access_requests_select_own" ON "access_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("access_requests"."user_id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "access_requests_select_admin" ON "access_requests" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "access_requests_update_admin" ON "access_requests" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "access_requests_service_role" ON "access_requests" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "downloads_select_admin" ON "downloads" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "downloads_insert_service" ON "downloads" AS PERMISSIVE FOR INSERT TO "service_role" WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "downloads_service_role" ON "downloads" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "releases_select_public" ON "releases" AS PERMISSIVE FOR SELECT TO "anon" USING (true);--> statement-breakpoint
CREATE POLICY "releases_insert_admin" ON "releases" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "releases_update_admin" ON "releases" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "releases_delete_admin" ON "releases" AS PERMISSIVE FOR DELETE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "releases_service_role" ON "releases" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);--> statement-breakpoint
CREATE POLICY "users_select_own" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("users"."id" = (select auth.uid()));--> statement-breakpoint
CREATE POLICY "users_select_admin" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "users_update_admin" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    )) WITH CHECK (EXISTS (
      SELECT 1 FROM users 
      WHERE id = (select auth.uid()) AND is_admin = true
    ));--> statement-breakpoint
CREATE POLICY "users_service_role" ON "users" AS PERMISSIVE FOR ALL TO "service_role" USING (true) WITH CHECK (true);