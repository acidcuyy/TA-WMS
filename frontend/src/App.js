import { useMemo, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import "./RouteTransitions.css";

export default function App() {
  const location = useLocation();

  // sanitize path -> class name safe
  const routeName = useMemo(() => {
    const p = location.pathname === "/" ? "splash" : location.pathname.slice(1);
    return p.replaceAll("/", "-").replaceAll(":", "");
  }, [location.pathname]);

  // nodeRef mapping to avoid findDOMNode warnings
  const refMap = useRef(new Map());
  const getNodeRef = (key) => {
    if (!refMap.current.has(key)) {
      refMap.current.set(key, { current: null });
    }
    return refMap.current.get(key);
  };

  const nodeRef = getNodeRef(location.pathname);

  return (
    <div className="routeShell">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          nodeRef={nodeRef}
          classNames="routeSlide"
          timeout={950}
        >
          <div ref={nodeRef} className={`routePage routePage--${routeName}`}>
            <Outlet />
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}
