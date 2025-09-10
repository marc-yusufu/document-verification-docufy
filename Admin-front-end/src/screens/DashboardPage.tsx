import React, { useState, useEffect } from "react";
import {
  MdFilterList,
  MdInfo,
  MdPrint,
  MdDownload,
  MdCancel,
  MdCheckCircle,
} from "react-icons/md";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";
import { supabase } from "../Authentication/supabaseconfig";

// Define shape of recent activity
interface RecentActivity {
  id: string;
  admin_id: string;
  action: string;
  doc_name?: string;
  status?: string;
  notes?: string;
  created_at: string;
}

interface Docs {
  id: string | number;
  fileName: string
  fileType: string
  filePath: string
  fileUrl: string
  status: string
  uploadedAt: Date

}

export default function DashboardPage() {
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [pendingCount, setPendingCount] = useState([]);
  const [verifiedCount, setVerifiedCount] = useState([]);
  const [rejectedCount, setRejectedCount] = useState([]);

  const [docs, setDocs] = useState<Docs[]>([]);



  ////fetching data directly from the frontend
  useEffect(() => {
    async function fetchActivity() {
      // Fetch recent activity logs
      const { data, error } = await supabase
        .from("recent_activity")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching activity:", error);
      } else {
        setActivity(data || []);
      }

      // Count docs by status
      const { count: pending } = await supabase
        .from("recent_activity")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: verified } = await supabase
        .from("recent_activity")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      const { count: rejected } = await supabase
        .from("recent_activity")
        .select("*", { count: "exact", head: true })
        .eq("status", "rejected");
    }

    fetchActivity();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("recent_activity_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "recent_activity" },
        (payload) => {
          setActivity((prev) => [payload.new as RecentActivity, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  ///fetching data by making api call to the backend
  useEffect(() => {
    async function getAllDocs(){
      try{
        const res = await fetch(`http://localhost:5000/documents?status=approved,rejected`)
        const countPending = await fetch(`http://localhost:5000/documents?status=pending`)
        const countVerified = await fetch(`http://localhost:5000/documents?status=approved`)
        const countRejected = await fetch(`http://localhost:5000/documents?status=rejected`)
        const docs = await res.json()
        const countDocsPending = await countPending.json()
        const countDocsVerified = await countVerified.json()
        const countDocsRejected = await countRejected.json()
        console.log('Document list: ', docs) //for console while debugging
        setDocs(docs);
        setPendingCount(countDocsPending.length);
        setVerifiedCount(countDocsVerified.length);
        setRejectedCount(countDocsRejected.length);
      }catch(err){
        console.error("Error while fetching documents: ", err);
      }
    }
    getAllDocs();
  }, []);



  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="main">
        <TopPanel />

        {/* Quick Stats */}
        <section className="quick-stats">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="card">
              <div className="card-header">Queue</div>
              <div className="card-value">{pendingCount}</div>
            </div>

            <div className="card">
              <div className="card-header">Verified</div>
              <div className="card-value">{verifiedCount}</div>
            </div>

            <div className="card">
              <div className="card-header">Rejected</div>
              <div className="card-value">{rejectedCount}</div>
            </div>

            <div className="card">
              <div className="card-header">Avg Verification Time</div>
              <div className="card-value">
                136 <span className="muted">s</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="recent">
          <div className="recent-header">
            <h3>Recent Activity</h3>
            <div className="recent-actions">
              <button><MdFilterList /></button>
              <button><MdInfo /></button>
              <button><MdPrint /></button>
              <button><MdDownload /></button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date &amp; Time</th>
                <th>Action</th>
                <th>Doc Name</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {activity.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.action}</td>
                  <td>{a.doc_name || "-"}</td>
                  <td>
                    {a.status === "approved" && (
                      <span className="status ok"><MdCheckCircle /></span>
                    )}
                    {a.status === "rejected" && (
                      <span className="status bad"><MdCancel /></span>
                    )}
                    {a.status === "pending" && (
                      <span className="status">Pending</span>
                    )}
                    {!a.status && "-"}
                  </td>
                  <td>{a.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {/* Inline CSS */}
      <style>{`
        .dashboard-container { display: flex; min-height: 100vh; font-family: sans-serif; background: #DEDEDE; }
        .main { flex: 1; padding: 1.5rem; background: #DEDEDE; display: flex; flex-direction: column; gap: 1.5rem; }
        .quick-stats h3 { font-weight: bold; margin-bottom: 1rem; }
        .stats-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
        .card { background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; min-width: 220px; }
        .card-header { font-weight: 600; margin-bottom: 0.5rem; }
        .card-value { font-weight: bold; font-size: 1.5rem; }
        .recent { background: #fff; padding: 1rem; border-radius: 10px; }
        .recent-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .recent-actions button { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 4px; }
        .recent-actions button:hover { background: #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: left; }
        th { color: #2563eb; font-weight: bold; }
        .status.ok { color: #15803d; font-size: 1.2rem; }
        .status.bad { color: #dc2626; font-size: 1.2rem; }
      `}</style>
    </div>
  );
}
