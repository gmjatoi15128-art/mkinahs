import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
	useSidebar,
} from "@/components/ui/sidebar";
import { LogOut, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type DashboardNavigationItem = { label: string; path: string; icon: LucideIcon; group?: string };

export default function DashboardLayout({
  children,
  title = "CMS",
  navigation = [],
  onNavigate,
  activePath,
}: {
  children: React.ReactNode;
  title?: string;
  navigation?: DashboardNavigationItem[];
  onNavigate?: (path: string) => void;
  activePath?: string;
}) {
  const { user, loading, logout } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center bg-slate-50 text-sm text-slate-600">Loading secure workspace…</div>;
  if (!user) return <div className="grid min-h-screen place-items-center bg-slate-50 p-6"><div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"><ShieldCheck className="mx-auto h-10 w-10 text-navy" /><h1 className="mt-5 text-xl font-bold text-navy">Secure CMS access</h1><p className="mt-2 text-sm leading-6 text-slate-600">Sign in using your assigned CMS email address and password.</p><Button className="mt-6 w-full" onClick={() => { window.location.href = "/cms-login"; }}>CMS sign in</Button></div></div>;
  return <SidebarProvider defaultOpen><CmsShell title={title} navigation={navigation} activePath={activePath} onNavigate={onNavigate} user={user} logout={logout}>{children}</CmsShell></SidebarProvider>;
}

function CmsShell({ children, title, navigation, activePath, onNavigate, user, logout }: { children: React.ReactNode; title: string; navigation: DashboardNavigationItem[]; activePath?: string; onNavigate?: (path: string) => void; user: NonNullable<ReturnType<typeof useAuth>["user"]>; logout: () => void }) {
  const { setOpenMobile } = useSidebar();
  const groups = navigation.reduce<Array<{ label?: string; items: DashboardNavigationItem[] }>>((result, item) => {
    const current = result[result.length - 1];
    if (!current || current.label !== item.group) result.push({ label: item.group, items: [item] });
    else current.items.push(item);
    return result;
  }, []);
  const activeLabel = navigation.find(item => item.path === activePath)?.label || title;
  const choose = (path: string) => { setOpenMobile(false); onNavigate?.(path); };
  return <><Sidebar collapsible="icon" className="border-r border-slate-200 bg-navy text-white"><SidebarHeader className="border-b border-white/10 p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl bg-gold-300 text-navy"><ShieldCheck className="h-5 w-5" /></div><div className="min-w-0 group-data-[collapsible=icon]:hidden"><p className="truncate font-bold">{title}</p><p className="text-xs text-slate-300">Institutional content</p></div></div></SidebarHeader><SidebarContent className="px-2 py-4"><SidebarMenu>{groups.map(group => <div key={group.label || "primary"} className="mb-4 last:mb-0"><p className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-400 group-data-[collapsible=icon]:hidden">{group.label || "Workspace"}</p>{group.items.map(item => <SidebarMenuItem key={item.path}><SidebarMenuButton tooltip={item.label} isActive={item.path === activePath} onClick={() => choose(item.path)} className="h-10 text-slate-200 hover:bg-white/10 hover:text-white data-[active=true]:bg-white/15 data-[active=true]:text-white"><item.icon className="h-4 w-4" /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem>)}</div>)}</SidebarMenu></SidebarContent><SidebarFooter className="border-t border-white/10 p-3"><div className="flex items-center gap-3 px-2 py-2 group-data-[collapsible=icon]:justify-center"><Avatar className="h-8 w-8"><AvatarFallback className="bg-teal-100 text-xs font-bold text-navy">{user.name?.charAt(0).toUpperCase() || "A"}</AvatarFallback></Avatar><div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-sm font-semibold">{user.name || "CMS user"}</p><p className="truncate text-xs text-slate-300">{user.role === "super_admin" ? "Super Admin" : "Content Manager"}</p></div></div><Button variant="ghost" size="sm" onClick={logout} className="w-full justify-start text-slate-200 hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center"><LogOut className="h-4 w-4" /><span className="group-data-[collapsible=icon]:hidden">Sign out</span></Button></SidebarFooter></Sidebar><SidebarInset className="bg-slate-50"><div className="flex h-14 items-center border-b border-slate-200 bg-white px-4 lg:hidden"><SidebarTrigger className="text-navy" /><span className="ml-3 text-sm font-bold text-navy">{activeLabel}</span></div><main className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</main></SidebarInset></>;
}
