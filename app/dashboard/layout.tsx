import Sidebar from "../components/sidebar";
import Header from "../components/header";
import LayoutWrapper from "../components/layout-wrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutWrapper>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="p-6">{children}</main>
      </div>
    </LayoutWrapper>
  );
}
