const fs = require('fs');
let code = fs.readFileSync('app/(main)/rent/request/RentalRequestFlow.jsx', 'utf8');

// I will just download or fetch the original StepBar if I can, or write it correctly.
const stepBarStart = code.indexOf('function StepBar');
const sidebarStart = code.indexOf('function Sidebar');

const stepBarNew = `function StepBar({ current }) {
  return (
    <div style={{ display: "flex", gap: "12px", marginBottom: "36px" }}>
      {STEPS.map((label, i) => {
        const idx = i + 1;
        const done = current > idx;
        const active = current === idx;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flex: 1 }}>
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: 700, flexShrink: 0,
                background: done ? "#16a34a" : active ? "#315cff" : "#e2e8f0",
                color: (done || active) ? "white" : "#94a3b8",
                transition: "background 0.3s",
              }}>
                {done ? <Check size={13} /> : idx}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap",
                color: active ? "#315cff" : done ? "#16a34a" : "#94a3b8",
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: "2px", flex: 1, marginBottom: "18px",
                background: done ? "#16a34a" : "#e2e8f0",
                transition: "background 0.3s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

`;

code = code.substring(0, stepBarStart) + stepBarNew + code.substring(sidebarStart);
fs.writeFileSync('app/(main)/rent/request/RentalRequestFlow.jsx', code);
