function DressCode() {
  return (
    <>
      <h3
        className="font-display mb-4 text-xl font-semibold tracking-[0.12em] uppercase"
        style={{ color: "var(--hueso)" }}
      >
        Dress Code
      </h3>

      <div
        className="font-body flex grow flex-col items-center justify-center space-y-4 text-[0.98rem] leading-relaxed"
        style={{ color: "var(--text-light)" }}
      >
        <p
          className="text-lg font-medium italic"
          style={{ color: "var(--hueso)" }}
        >
          Arreglado informal
        </p>

        <p className="text-center">
          No hace falta ir de gala.
          <br />
          Lo importante es venir cómodo/a y con ganas de festejar.
        </p>

        <p className="text-sm italic opacity-75">*Sugerimos calzado cómodo.*</p>
      </div>
    </>
  );
}

export default DressCode;
