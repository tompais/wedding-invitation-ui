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
        <p>Puede refrescar, así que llevá algo para abrigarte.</p>
        <p>
          Llegá con tiempo así arrancamos tranquilos.
          <br />
          Lo más importante es que estés ahí con nosotros. 🤍
        </p>
      </div>
    </>
  );
}

export default Tips;
