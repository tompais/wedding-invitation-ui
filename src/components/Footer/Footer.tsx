function Footer() {
  return (
    <footer
      className="w-full bg-gradient-to-t from-[var(--bourdeaux-dark)] to-[var(--bourdeaux)] px-8 pt-16 pb-10 text-center"
      style={{ color: "var(--text-light)" }}
    >
      <div className="mx-auto max-w-[800px]">
        <p
          className="font-display mb-2 text-lg font-medium tracking-wider"
          style={{ color: "var(--hueso)" }}
        >
          Lo más importante es que estés ahí con nosotros.
        </p>
        <span
          className="font-body text-sm tracking-widest uppercase opacity-75"
          style={{ color: "var(--text-light)" }}
        >
          Angie & Tomi · Julio 2026
        </span>
      </div>
    </footer>
  );
}

export default Footer;
