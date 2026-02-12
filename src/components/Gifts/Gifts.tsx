function Gifts() {
  return (
    <>
      <h3
        className="font-display mb-4 text-xl font-semibold tracking-[0.12em] uppercase"
        style={{ color: "var(--hueso)" }}
      >
        Gifts
      </h3>
      <div
        className="font-body flex grow flex-col items-center justify-center space-y-4 text-center text-[0.98rem] leading-relaxed"
        style={{ color: "var(--text-light)" }}
      >
        <p>Si querés regalarnos algo más que tu presencia,</p>
        <p>podés ayudarnos a sumar kilómetros a nuestro viaje.</p>

        <div className="mt-4 inline-block rounded-lg border border-dashed border-white/40 px-3 py-2">
          <span className="block text-xs opacity-80">Alias</span>
          <strong className="text-sm tracking-wider">angie.tomi.viaje</strong>
        </div>
      </div>
    </>
  );
}

export default Gifts;
