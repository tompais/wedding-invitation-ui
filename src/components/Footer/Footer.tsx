function Footer() {
  return (
    <footer
      className="px-8 pt-16 pb-10 w-full text-center bg-gradient-to-t from-[var(--bourdeaux-dark)] to-[var(--bourdeaux)]"
      style={{ color: "var(--text-light)" }}
    >
      <div className="mx-auto max-w-[800px]">
        <p
          className="mb-2 text-lg font-medium tracking-wider font-display"
          style={{ color: "var(--hueso)" }}
        >
          Lo más importante es que estés ahí.
        </p>
        <span
          className="text-sm tracking-widest uppercase opacity-75 font-body"
          style={{ color: "var(--text-light)" }}
        >
          Angie & Tomi · Julio 2026
        </span>
      </div>
    </footer>
  );
}

export default Footer;
