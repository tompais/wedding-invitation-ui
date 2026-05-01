export default function Divider() {
  return (
    <div className="flex justify-center items-center my-6 opacity-60">
      <svg
        width="100"
        height="20"
        viewBox="0 0 100 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="divider-svg text-bourdeaux-light"
        style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}
        aria-hidden="true"
      >
        <path
          d="M0 10 Q 15 5, 30 10 T 60 10 T 90 10 L 100 10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="10" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}
