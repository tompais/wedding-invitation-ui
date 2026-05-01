function Gifts() {
  return (
    <>
      <h3
        className="mb-4 text-xl font-semibold uppercase font-display tracking-[0.12em]"
        style={{ color: "var(--hueso)" }}
      >
        Gifts
      </h3>
      <div
        className="flex flex-col justify-center items-center space-y-4 leading-relaxed text-center font-body grow text-[0.98rem]"
        style={{ color: "var(--text-light)" }}
      >
        <p>Si querés regalarnos algo más que tu presencia,</p>
        <p>podés ayudarnos a sumar kilómetros a nuestro viaje.</p>

        <div className="inline-block py-2 px-3 mt-4 rounded-lg border border-dashed border-white/40">
          <span className="block text-xs opacity-80">Alias</span>
          <strong className="text-sm tracking-wider">angie.tomi.viaje</strong>
        </div>
      </div>
    </>
  );
}

export default Gifts;
