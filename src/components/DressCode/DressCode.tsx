function DressCode() {
  return (
    <>
      <h3
        className="mb-4 text-xl font-semibold uppercase font-display tracking-[0.12em]"
        style={{ color: "var(--hueso)" }}
      >
        Dress Code
      </h3>

      <div
        className="flex flex-col justify-center items-center space-y-4 leading-relaxed font-body grow text-[0.98rem]"
        style={{ color: "var(--text-light)" }}
      >
        <p
          className="text-lg italic font-medium"
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
