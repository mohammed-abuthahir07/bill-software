import { useEffect, useState } from "react";
import {
    Users,
    Package,
    Receipt,
    IndianRupee,
    Wallet,
    LayoutDashboard,
    Loader2,
    RefreshCw,
} from "lucide-react";
import { getAdminDashboard } from "../../../admin/services/adminDashboardService";
import "./AdminDashboard.css";

const formatCount = (value) =>
    Number(value || 0).toLocaleString("en-IN");

const formatMoney = (value) =>
    `₹ ${Number(value || 0).toLocaleString("en-IN")}`;

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalInvoices: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
    });

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const data = await getAdminDashboard();
            setDashboard({
                totalUsers: data.totalUsers,
                totalProducts: data.totalProducts,
                totalInvoices: data.totalInvoices,
                totalRevenue: data.totalRevenue,
                monthlyRevenue: data.monthlyRevenue,
            });
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const cards = [
        { title: "Total Users", value: formatCount(dashboard.totalUsers), hint: "Registered accounts", icon: Users, tone: "blue" },
        { title: "Total Products", value: formatCount(dashboard.totalProducts), hint: "Catalog items", icon: Package, tone: "purple" },
        { title: "Total Invoices", value: formatCount(dashboard.totalInvoices), hint: "Bills generated", icon: Receipt, tone: "amber" },
        { title: "Total Revenue", value: formatMoney(dashboard.totalRevenue), hint: "All-time collections", icon: IndianRupee, tone: "green" },
    ];

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div>
                    <p className="dashboard-kicker">
                        <LayoutDashboard size={14} />
                        Overview
                    </p>
                    <h1 className="dashboard-title">Admin Dashboard</h1>
                    <p className="dashboard-subtitle">
                        Snapshot of users, catalog, invoices, and revenue across the platform.
                    </p>
                </div>
                <button
                    type="button"
                    className="dashboard-refresh"
                    onClick={loadDashboard}
                    disabled={loading}
                >
                    {loading ? <Loader2 size={16} className="spin-icon" /> : <RefreshCw size={16} />}
                    Refresh
                </button>
            </header>

            {loading ? (
                <>
                    <div className="dashboard-cards">
                        {[1, 2, 3, 4].map((item) => (
                            <div className="card card-skeleton" key={item} />
                        ))}
                    </div>
                    <div className="recent-card card-skeleton" style={{ minHeight: 180 }} />
                </>
            ) : (
                <>
                    <div className="dashboard-cards">
                        {cards.map((card, index) => {
                            const Icon = card.icon;
                            return (
                                <article
                                    className={`card tone-${card.tone}`}
                                    key={card.title}
                                    style={{ animationDelay: `${index * 80}ms` }}
                                >
                                    <div className="card-top">
                                        <h3>{card.title}</h3>
                                        <span className={`card-icon ${card.tone}`}>
                                            <Icon size={18} />
                                        </span>
                                    </div>
                                    <h2>{card.value}</h2>
                                    <span className="card-hint">{card.hint}</span>
                                </article>
                            );
                        })}
                    </div>

                    <div className="dashboard-bottom">
                        <div className="recent-card">
                            <div className="recent-icon">
                                <Wallet size={22} />
                            </div>
                            <p>This month</p>
                            <h3>Monthly Revenue</h3>
                            <h2>{formatMoney(dashboard.monthlyRevenue)}</h2>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
