import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { checkSubscription } from "@/lib/subscription";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const isPremium = await checkSubscription();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isPremium={isPremium} />
      <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
        <Sidebar isPremium={isPremium} />
      </div>
      <main className="md:pl-20 pt-16 flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default RootLayout;
