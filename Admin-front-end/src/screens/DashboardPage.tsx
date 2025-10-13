import React, { useState, useEffect } from "react";
import {
  MdInfo,
  MdCancel,
  MdCheckCircle,
} from "react-icons/md";
import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { supabase } from "../Authentication/supabaseconfig";
import { Line } from "react-chartjs-2";
import 'chart.js/auto';

interface RecentActivity {
  id: string;
  admin_id: string;
  action: string;
  doc_name?: string;
  status?: string;
  notes?: string;
  created_at: string;
  submitted_at: string;
  verified_at: string;
}

interface Docs {
  id: string | number;
  fileName: string;
  fileType: string;
  filePath: string;
  fileUrl: string;
  status: string;
  verified_at: string;
  file_name: string;
  comment: string;
}

const DashboardPage: React.FC = () => {
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [docs, setDocs] = useState<Docs[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    avgVerificationTime: 0,
  });
  const [trendData, setTrendData] = useState<{ dates: string[]; counts: number[] }>({ dates: [], counts: [] });

  // Map color names to Tailwind classes
  const colorMap: Record<string, string> = {
    yellow: "text-yellow-500",
    green: "text-green-500",
    red: "text-red-500",
    blue: "text-blue-500",
  };

  // --- Fetch Quick Stats ---
  const fetchStats = async () => {
    try {
      const pendingRes = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "pending");
      const approvedRes = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "Approved");
      const rejectedRes = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("status", "Rejected");

      const avgTime = 136; // placeholder, replace with real calculation

      setStats({
        pending: pendingRes.count || 0,
        approved: approvedRes.count || 0,
        rejected: rejectedRes.count || 0,
        avgVerificationTime: avgTime,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // --- Fetch Recent Activity ---
  const fetchActivity = async () => {
    try {
      const { data, error } = await supabase
        .from("recent_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) console.error(error);
      else setActivity(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch Recent Docs ---
  const fetchDocs = async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(5);
        setDocs(Array.isArray(data) ? data : [])
      if (error) console.error(error);
      else setDocs(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Fetch Trend Data ---
  const fetchTrends = async () => {
    try {
      const { data } = await supabase
        .from("recent_activity")
        .select("created_at")
        .order("created_at", { ascending: true });
      if (!data) return;

      const dateMap: Record<string, number> = {};
      data.forEach((item) => {
        const date = new Date(item.created_at).toLocaleDateString();
        dateMap[date] = (dateMap[date] || 0) + 1;
      });

      setTrendData({ dates: Object.keys(dateMap), counts: Object.values(dateMap) });
    } catch (err) {
      console.error(err);
    }
  };

  // --- Realtime subscription ---
  useEffect(() => {
    fetchStats();
    fetchActivity();
    fetchDocs();
    fetchTrends();

    const channel = supabase
      .channel("recent_activity_changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "recent_activity" }, () => {
        fetchActivity();
        fetchStats();
        fetchTrends();
        fetchDocs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // --- Quick Stats Card Component ---
  const QuickStatsCard = ({ title, count, icon, color, trend }: any) => (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="text-gray-700 font-semibold">{title}</span>
        <div className={`${colorMap[color]} text-2xl`}>{icon}</div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-2xl font-bold">{count}</span>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
            {trend >= 0 ? <FiArrowUpRight /> : <FiArrowDownRight />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen font-sans bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-6 flex flex-col gap-6">
        <TopPanel />
        <h2 className="text-2xl font-bold text-gray-800">Welcome back!</h2>

        {/* Quick Stats */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <QuickStatsCard title="Pending" count={stats.pending} color="yellow" icon={<MdCancel />} trend={5} />
          <QuickStatsCard title="Verified" count={stats.approved} color="green" icon={<MdCheckCircle />} trend={10} />
          <QuickStatsCard title="Rejected" count={stats.rejected} color="red" icon={<MdCancel />} trend={-2} />
          <QuickStatsCard title="Avg Verification Time" count={stats.avgVerificationTime} color="blue" icon={<MdInfo />} trend={-1} />
        </section>

        {/* Trend Chart */}
        {trendData.dates.length > 0 && (
          <section className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Verification Trend</h3>
            <Line
              data={{
                labels: trendData.dates,
                datasets: [
                  {
                    label: "Documents Verified",
                    data: trendData.counts,
                    fill: true,
                    backgroundColor: "rgba(59,130,246,0.2)",
                    borderColor: "rgba(59,130,246,1)",
                    tension: 0.3,
                  },
                ],
              }}
            />
          </section>
        )}

        {/* Recent Activity + Docs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
            <table className="w-full min-w-[600px] text-sm border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Date & Time</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Doc Name</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Notes</th>
                </tr>
                <tr>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {docs.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2">{new Date(a.verified_at).toLocaleDateString()}</td>
                    <td className="py-2">-</td>
                    <td className="py-2">{a.file_name || 'N/A'}</td>
                    <td className="py-2">{a.status}</td>
                    <td className="py-2">{a.comment || '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tbody>
                {activity.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-2">{new Date(a.created_at).toLocaleString()}</td>
                    <td className="py-2">{a.action}</td>
                    <td className="py-2">{a.doc_name || "-"}</td>
                    <td className="py-2">
                      {a.status === "approved" && <span className="text-green-600 font-bold flex items-center gap-1"><MdCheckCircle /> Approved</span>}
                      {a.status === "rejected" && <span className="text-red-600 font-bold flex items-center gap-1"><MdCancel /> Rejected</span>}
                      {a.status === "pending" && <span className="text-yellow-600 font-bold">Pending</span>}
                    </td>
                    <td className="py-2">{a.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Latest Documents</h3>
            <ul className="flex flex-col gap-2">
              {docs.map((d) => (
                <li key={d.id} className="flex justify-between items-center p-2 rounded hover:bg-gray-50">
                  <span>{d.fileName}</span>
                  <span className={`text-sm font-bold ${d.status === "approved" ? "text-green-600" : d.status === "rejected" ? "text-red-600" : "text-yellow-600"}`}>
                    {d.status}
                  </span>
                  <a href={d.fileUrl} target="_blank" className="text-blue-500 hover:underline">View</a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
