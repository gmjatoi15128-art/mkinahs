import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Admin from "@/pages/Admin";
import CmsAccess from "@/pages/CmsAccess";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import {
  AboutPage,
  AdmissionsPage,
  ClinicalTrainingPage,
  CmsContentPage,
  ContactPage,
  DownloadsPage,
  EventDetailPage,
  EventsPage,
  FacilitiesPage,
  FacultyDetailPage,
  FacultyPage,
  GalleryPage,
  NewsDetailPage,
  NewsPage,
  ProgramDetailPage,
  ProgramsPage,
  StudentLifePage,
} from "@/pages/PublicPages";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return <Switch>
    <Route path="/" component={Home} />
    <Route path="/about" component={AboutPage} />
    <Route path="/programs" component={ProgramsPage} />
    <Route path="/programs/:slug" component={ProgramDetailPage} />
    <Route path="/admissions" component={AdmissionsPage} />
    <Route path="/faculty" component={FacultyPage} />
    <Route path="/faculty/:slug" component={FacultyDetailPage} />
    <Route path="/facilities" component={FacilitiesPage} />
    <Route path="/clinical-training" component={ClinicalTrainingPage} />
    <Route path="/student-life" component={StudentLifePage} />
    <Route path="/gallery" component={GalleryPage} />
    <Route path="/news" component={NewsPage} />
    <Route path="/news/:slug" component={NewsDetailPage} />
    <Route path="/events" component={EventsPage} />
    <Route path="/events/:slug" component={EventDetailPage} />
    <Route path="/downloads" component={DownloadsPage} />
    <Route path="/contact" component={ContactPage} />
    <Route path="/cms-login" component={CmsAccess} />
    <Route path="/cms-setup" component={CmsAccess} />
    <Route path="/admin" component={Admin} />
    <Route path="/:slug" component={CmsContentPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
