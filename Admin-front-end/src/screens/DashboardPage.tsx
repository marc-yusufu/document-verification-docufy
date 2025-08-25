import React from "react";
import { useState, useEffect } from "react";
import {
  MdDashboard,
  MdListAlt,
  MdVerified,
  MdSettings,
  MdHelpOutline,
  MdLogout,
  MdSearch,
  MdNotifications,
  MdFilterList,
  MdInfo,
  MdPrint,
  MdDownload,
  MdCheckCircle,
  MdCancel,
} from "react-icons/md";
import { Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import TopPanel from "../components/TopPanel";

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

  const [docs, setDocs] = useState<Docs[]>([]);
  const [pendingCount, setPendingCount] = useState([]);
  const [verifiedCount, setVerifiedCount] = useState([]);
  const [rejectedCount, setRejectedCount] = useState([]);

    //list all document in the queue
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
    <>
      <div className="dashboard-container">
        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <main className="main">
          {/* Top Bar */}
          <TopPanel />

          {/* Quick Stats */}
          <section className="quick-stats">
            <h3>Quick Stats</h3>
            <div className="stats-grid">
              <div className="card">
                <div className="card-header">
                  <span>Queue</span>
                  <span className="muted">15s</span>
                </div>
                <div className="card-value">{pendingCount}</div>
                <div className="down">↘ 15% waiting time</div>
              </div>

              <div className="card">
                <div className="card-header">Verified Today</div>
                <div className="card-value">{verifiedCount}</div>
                <div className="up">↗ 26% from yesterday</div>
              </div>

              <div className="card">
                <div className="card-header">Rejected Today</div>
                <div className="card-value">{rejectedCount}</div>
                <div className="up">↗ 2.6% from yesterday</div>
              </div>

              <div className="card">
                <div className="card-header">Average Verification Time</div>
                <div className="card-value">
                  136 <span className="muted">seconds</span>
                </div>
                <div className="down">↘ 6% from yesterday</div>
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
              {docs.map((doc) => (
                <tr key={doc.id}>
                  <td>{new Date(doc.uploadedAt).toDateString()}, {new Date(doc.uploadedAt).toLocaleTimeString()}</td>
                  <td>Verifying &amp; Certifying</td>
                  <td>{doc.fileName}</td>
                  <td>{doc.status}</td>
                  <td>-</td>
                </tr>
              ))}
                <tr>
                  <td>30 July 2025, 09:05AM</td>
                  <td>Verifying &amp; Certifying</td>
                  <td>IDCopy.jpg</td>
                  <td className="status bad"><MdCancel /></td>
                  <td>Image is unclear</td>
                </tr>
                <tr>
                  <td>30 July 2025, 08:12AM</td>
                  <td>Logged In</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>

      {/* CSS in same file */}
      <style>{`
        .dashboard-container { display: flex; min-height: 100vh; font-family: sans-serif; background: #DEDEDE; }
        
        .main { flex: 1; padding: 1.5rem; background: #DEDEDE; display: flex; flex-direction: column; gap: 1.5rem; }
        .page-title { font-weight: bold; font-size: 1.25rem; }
        .search-notify { display: flex; align-items: center; gap: 1rem; }
        .search-box { position: relative; }
        .search-box input { padding: 0.4rem 2rem 0.4rem 0.6rem; border-radius: 9999px; border: 1px solid #ccc; }
        .search-box button { position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%); background: none; border: none; color: #2563eb; }
        .icon-btn { background: none; border: none; color: #2563eb; font-size: 1.25rem; cursor: pointer; }
        .profile { display: flex; align-items: center; gap: 0.75rem; background: #fff; padding: 0.5rem 1rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .profile img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #2563eb; }
        .name { font-weight: bold; }
        .role { font-size: 0.8rem; color: #555; }
        .quick-stats h3 { font-weight: bold; margin-bottom: 1rem; }
        .stats-grid { display: flex; gap: 1rem; flex-wrap: wrap; }
        .card { background: #fff; padding: 1rem; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; min-width: 220px; display: flex; flex-direction: column; }
        .card-header { display: flex; justify-content: space-between; font-weight: 600; margin-bottom: 0.5rem; }
        .card-value { font-weight: bold; font-size: 1.5rem; }
        .muted { color: #888; font-size: 0.8rem; }
        .up { margin-top: auto; color: #15803d; font-weight: 600; font-size: 0.85rem; }
        .down { margin-top: auto; color: #dc2626; font-weight: 600; font-size: 0.85rem; }
        .recent { background: #fff; padding: 1rem; border-radius: 10px; display: flex; flex-direction: column; gap: 1rem; }
        .recent-header { display: flex; justify-content: space-between; align-items: center; }
        .recent-actions button { background: none; border: none; cursor: pointer; padding: 0.3rem; border-radius: 4px; }
        .recent-actions button:hover { background: #e5e7eb; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 0.5rem; border-bottom: 1px solid #ddd; text-align: left; }
        th { color: #2563eb; font-weight: bold; }
        .status.ok { color: #15803d; font-size: 1.2rem; }
        .status.bad { color: #dc2626; font-size: 1.2rem; }
      `}</style>
    </>
  );
}
