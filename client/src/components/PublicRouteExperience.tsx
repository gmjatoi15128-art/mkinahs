import { useEffect, useRef, useState } from "react";

export default function PublicRouteExperience({ routeKey, children }: { routeKey: string; children: React.ReactNode }) {
  const previousRoute = useRef(routeKey);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    window.scrollTo({ top: 0, behavior: "auto" });
    setIsTransitioning(true);
    const timer = window.setTimeout(() => setIsTransitioning(false), 260);
    return () => window.clearTimeout(timer);
  }, [routeKey]);

  return <div className="public-route-shell">
    <span className="sr-only" aria-live="polite">{isTransitioning ? "Loading page" : "Page ready"}</span>
    {isTransitioning ? <div aria-hidden="true" className="public-route-progress"><span /></div> : null}
    <div key={routeKey} className="public-route-enter">{children}</div>
  </div>;
}
