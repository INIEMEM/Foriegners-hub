import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppWidget from "@/components/shared/WhatsAppWidget";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }) {
  let whatsappNumber = "+37060000000";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("id", "whatsapp_number")
      .maybeSingle();
    if (data?.value) {
      whatsappNumber = data.value;
    }
  } catch (e) {
    // fallback
  }

  return (
    <div className="flex min-h-screen flex-col" suppressHydrationWarning>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppWidget whatsappNumber={whatsappNumber} />
    </div>
  );
}
