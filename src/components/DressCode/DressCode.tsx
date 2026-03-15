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
          Arreglado
        </p>

        <p className="text-center">
          Pensá en un look de festejo: arreglado/a, con tu estilo.
          <br />
          Sin traje completo ni ropa de playa.
        </p>

        <p className="text-sm italic opacity-75">*Sugerimos calzado cómodo.*</p>
      </div>
    </>
  );
}

export default DressCode;
