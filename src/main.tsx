import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import "./index.css";
import { AppLayout } from "@/layout/AppLayout";
import { AuthLayout } from "@/layout/AuthLayout";
import { DashboardLayout } from "@/layout/DashboardLayout";
import { routes } from "@/routes";
import { persistor, store } from "@/store/store";
import type { LocalRoutes } from "@/types";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
    mutations: { retry: false },
  },
});

function wrap(route: LocalRoutes) {
  if (route.noLayout) return route.element;
  if (route.requiresAuth) return <DashboardLayout>{route.element}</DashboardLayout>;
  return <AuthLayout>{route.element}</AuthLayout>;
}

function renderRoute(route: LocalRoutes, nested = false) {
  if (nested && route.path === "") return <Route key="index" index element={route.element} />;
  return (
    <Route key={route.path} path={route.path} element={nested ? route.element : wrap(route)}>
      {route.children?.map((child) => renderRoute(child, true))}
    </Route>
  );
}

async function enableMocks() {
  if (import.meta.env.VITE_APP_MOCK !== "true") return;
  const { worker } = await import("@/mocks/browser");
  await worker.start({ onUnhandledRequest: "bypass", quiet: true });
}

enableMocks().then(() =>
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <Suspense fallback={null}>
                <AppLayout>
                  <Routes>{routes.map((r) => renderRoute(r))}</Routes>
                </AppLayout>
              </Suspense>
            </BrowserRouter>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </StrictMode>,
  ),
);
