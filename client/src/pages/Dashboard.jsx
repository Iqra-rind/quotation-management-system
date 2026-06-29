import { useEffect, useState } from "react";
import { Building2, FileClock, FileCheck2, FileWarning, Activity } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getDashboardStats } from "../api/client";
import "./Dashboard.css";

const STATUS_COLORS = {
  pending: "#A8A091",
  submitted: "#5B86A8",
  approved: "#3D8B5C",
  rejected: "#B5544A",
};

function timeAgo(dateStr) {
  const date = new Date(dateStr.replace(" ", "T") + "Z");
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state">Loading dashboard…</div>;
  if (!stats) return <div className="loading-state">Could not load dashboard data.</div>;

  const chartData = stats.statusBreakdown.map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: STATUS_COLORS[s.status] || "#999",
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>An overview of vendors, quotation activity, and recent changes across the system.</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Building2} label="Total Vendors" value={stats.totalVendors} />
        <StatCard icon={FileClock} label="Active Quotations" value={stats.activeQuotations} />
        <StatCard icon={FileWarning} label="Pending Quotations" value={stats.pendingQuotations} />
        <StatCard
          icon={FileCheck2}
          label="Approved Quotations"
          value={stats.approvedQuotations}
          accent
        />
      </div>

      <div className="dash-grid">
        <div className="card dash-panel">
          <div className="dash-panel-header">
            <h2>Quotation Status Breakdown</h2>
          </div>
          {chartData.length === 0 ? (
            <div className="empty-state">
              <p>No quotations yet.</p>
            </div>
          ) : (
            <div className="chart-row">
              <div style={{ width: 180, height: 180 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: 6,
                        fontSize: 12,
                        color: "var(--color-text)",
                      }}
                      labelStyle={{ color: "var(--color-text)" }}
                      itemStyle={{ color: "var(--color-text)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {chartData.map((entry, i) => (
                  <div className="chart-legend-item" key={i}>
                    <span className="legend-dot" style={{ background: entry.color }} />
                    <span className="legend-label">{entry.name}</span>
                    <span className="legend-value">{entry.value}</span>
                  </div>
                ))}
                <div className="chart-legend-item total-row">
                  <span className="legend-label">Approved value</span>
                  <span className="legend-value tabular">
                    Rs. {Number(stats.totalQuotationValue).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card dash-panel">
          <div className="dash-panel-header">
            <h2>Recent Activity</h2>
            <Activity size={16} color="var(--color-text-muted)" />
          </div>
          {stats.recentActivities.length === 0 ? (
            <div className="empty-state">
              <p>No activity recorded yet.</p>
            </div>
          ) : (
            <ul className="activity-list">
              {stats.recentActivities.map((a) => (
                <li key={a.id} className="activity-item">
                  <span className={`activity-dot activity-dot-${a.entity_type}`} />
                  <div>
                    <p className="activity-desc">{a.description}</p>
                    <p className="activity-time">{timeAgo(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">
        <Icon size={15} />
        {label}
      </div>
      <div className={"stat-card-value" + (accent ? " accent" : "")}>{value}</div>
    </div>
  );
}
