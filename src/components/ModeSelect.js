export const ModeSelect = ({ mode, setMode }) => {
  return (
    <div className="modeSelect">
      <button
        className={
          mode === "create" ? "modeSelectButton active" : "modeSelectButton"
        }
        onClick={() => setMode("create")}
      >
        Create
      </button>

      <button
        className={
          mode !== "create" ? "modeSelectButton active" : "modeSelectButton"
        }
        onClick={() => setMode("buy")}
      >
        Buy
      </button>
    </div>
  );
};
