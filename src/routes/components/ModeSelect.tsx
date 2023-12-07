export const ModeSelect = ({ mode }: any) => {
  return (
    <div class="modeSelect">
      <button
        class={
          mode.value === "create"
            ? "modeSelectButton active"
            : "modeSelectButton"
        }
        onClick$={() => (mode.value = "create")}
      >
        Create NFTs
      </button>

      <button
        class={
          mode.value === "view" ? "modeSelectButton active" : "modeSelectButton"
        }
        onClick$={() => (mode.value = "view")}
      >
        View NFTs
      </button>
    </div>
  );
};
