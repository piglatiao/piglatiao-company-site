import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext.js";
import PublicLayout from "./components/layout/PublicLayout.js";

// 懒加载页面组件 — 实现路由级代码分割
const Home = lazy(() => import("./pages/Home.js"));
const About = lazy(() => import("./pages/About.js"));
const Products = lazy(() => import("./pages/Products.js"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.js"));
const News = lazy(() => import("./pages/News.js"));
const NewsDetail = lazy(() => import("./pages/NewsDetail.js"));
const Contact = lazy(() => import("./pages/Contact.js"));
const Login = lazy(() => import("./pages/admin/Login.js"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.js"));
const ProductManage = lazy(() => import("./pages/admin/ProductManage.js"));
const ArticleManage = lazy(() => import("./pages/admin/ArticleManage.js"));
const ContactManage = lazy(() => import("./pages/admin/ContactManage.js"));
const UserManage = lazy(() => import("./pages/admin/UserManage.js"));
const Settings = lazy(() => import("./pages/admin/Settings.js"));
const ProtectedRoute = lazy(() => import("./admin/ProtectedRoute.js"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout.js"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60000, refetchOnWindowFocus: false },
  },
});

// 加载占位组件
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-line border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* 公开路由 */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
              <Route path="/about" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
              <Route path="/products" element={<Suspense fallback={<PageLoader />}><Products /></Suspense>} />
              <Route path="/products/:id" element={<Suspense fallback={<PageLoader />}><ProductDetail /></Suspense>} />
              <Route path="/news" element={<Suspense fallback={<PageLoader />}><News /></Suspense>} />
              <Route path="/news/:id" element={<Suspense fallback={<PageLoader />}><NewsDetail /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
            </Route>

            {/* 管理端登录 */}
            <Route path="/admin/login" element={<Suspense fallback={<PageLoader />}><Login /></Suspense>} />

            {/* 管理端路由（需认证） */}
            <Route element={<Suspense fallback={<PageLoader />}><ProtectedRoute /></Suspense>}>
              <Route element={<Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>}>
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
                <Route path="/admin/products" element={<Suspense fallback={<PageLoader />}><ProductManage /></Suspense>} />
                <Route path="/admin/articles" element={<Suspense fallback={<PageLoader />}><ArticleManage /></Suspense>} />
                <Route path="/admin/contacts" element={<Suspense fallback={<PageLoader />}><ContactManage /></Suspense>} />
                <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><UserManage /></Suspense>} />
                <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
