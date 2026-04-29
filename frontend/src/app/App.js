import { Outlet, useLocation } from "react-router-dom";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { createRef, useRef } from "react";
import "./RouteTransitions.css";

export default function App() {
  const location = useLocation();

  // ref unik per route
  const refMap = useRef(new Map());
  if (!refMap.current.has(location.pathname)) {
    refMap.current.set(location.pathname, createRef());
  }
  const nodeRef = refMap.current.get(location.pathname);

  const routeName =
    location.pathname === "/" ? "splash" : location.pathname.replace("/", "");

  return (
    <div className="routeShell">
      <TransitionGroup component={null}>
        <CSSTransition
          key={location.pathname}
          nodeRef={nodeRef}
          classNames="route"
          timeout={350}
          unmountOnExit
        >
          <div ref={nodeRef} className={`routePage routePage--${routeName}`}>
            <Outlet />
          </div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
}
