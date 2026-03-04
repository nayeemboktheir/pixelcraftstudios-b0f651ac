
DROP POLICY IF EXISTS "Admins can manage landing pages" ON public.landing_pages;

CREATE POLICY "Admins can manage landing pages"
ON public.landing_pages
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
