function Tips() {
  return (
    <>
      <h3
        className="font-display mb-4 text-xl font-semibold tracking-[0.12em] uppercase"
        style={{ color: "var(--hueso)" }}
      >
        Tips & Notes
      </h3>
      <div
        className="font-body flex grow flex-col items-center justify-center space-y-4 text-center text-[0.98rem] leading-relaxed"
        style={{ color: "var(--text-light)" }}
      >
        <p>La fiesta es al aire libre.</p>
        <p>Traé abrigo liviano para la noche.</p>
        <p>
          Llegá con tiempo así arrancamos tranquilos.
          <br />Y lo más importante: vení con ganas de pasarla bien 🤍
        </p>
      </div>
    </>
  );
}

export default Tips;
