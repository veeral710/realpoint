import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail, isAdminPhone } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, phone")
    .eq("id", user.id)
    .single();

  const phone = profile?.phone ?? user.phone;
  const email = user.email;
  const allowed =
    profile?.is_admin || isAdminPhone(phone) || isAdminEmail(email);
  if (!allowed) {
    return (
      <main className="container">
        <div className="alert">
          Access denied. Add your email to ADMIN_EMAILS (or phone to
          ADMIN_PHONE_NUMBERS) and set is_admin on your profile in Studio.
        </div>
        <Link href="/">Back home</Link>
      </main>
    );
  }

  return (
    <>
      <nav className="nav">
        <Link href="/admin" className="brand">
          RealPoint Admin
        </Link>
        <Link href="/admin/news">News</Link>
        <Link href="/admin/listings">Listings</Link>
        <Link href="/admin/tp-schemes">TP schemes</Link>
        <form
          action="/api/auth/signout"
          method="post"
          style={{ margin: 0 }}
        >
          <button type="submit" className="btn btn-secondary">
            Sign out
          </button>
        </form>
      </nav>
      <main className="container">{children}</main>
    </>
  );
}
