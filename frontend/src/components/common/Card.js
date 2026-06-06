import "./Card.css";

export default function Card({ children, className = "", ...props }) {
  return (
    <div className={["card", className].join(" ")} {...props}>
      {children}
    </div>
  );
}
