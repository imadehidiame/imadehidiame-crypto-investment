import SideNav from "../ui/dashboard/sidenav";
import Footer from "../ui/layouts/footer";
import Navbar from "../ui/layouts/navbar";

export default function Layout({children}:{children:React.ReactNode}){
    return (
      <div className="flex flex-col min-h-screen bg-black text-gray-100">
        <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
        <Footer />
      </div>
    );
}