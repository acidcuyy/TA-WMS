import "./Button.css";

export default function Button({
  children,
  variant = "primary",
  fullWidth = false,
  className = "",
  ...props
}) {
  return (
    <button
      className={[
        "btn",
        `btn--${variant}`,
        fullWidth ? "btn--full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
