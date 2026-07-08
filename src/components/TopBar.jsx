export default function TopBar() {
  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo">A</div>
        <div>
          <h1>Aurelius Asset Management</h1>
          <p>Private Client Portfolio · Growth Mandate</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="live-pill"><span className="live-dot"></span> Live · 10:42 CET</div>
        <div className="avatar">KM</div>
      </div>
    </div>
  );
}
