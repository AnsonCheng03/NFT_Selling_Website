export const ModeSelect = ({ mode, setMode }) => {
  return (
    <div className="modeSelect">
      <button
        className={
          mode === "create" ? "modeSelectButton active" : "modeSelectButton"
        }
        onClick={() => setMode("create")}
      >
        Create NFTs
      </button>

      <button
        className={
          mode !== "create" ? "modeSelectButton active" : "modeSelectButton"
        }
        onClick={() => setMode("buy")}
      >
        View NFTs
      </button>
    </div>
  );
};
