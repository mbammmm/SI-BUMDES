import Link from "next/link";
import { Wallet, Package, Mail, FileText, TrendingUp, Filter } from "lucide-react";
import prisma from "@/lib/prisma";

type DashboardData = {
  stats: {
    totalTransactions: number;
    totalAssets: number;
    totalLetters: number;
    pendingLetters: number;
  };
  recentTransactions: any[];
  recentLetters: any[];
};

type DashboardPageProps = {
  searchParams: Promise<{ unitUsahaId?: string; startDate?: string; endDate?: string }>;
};

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = await props.searchParams;
  const unitUsahaId = searchParams.unitUsahaId;
  const startDate = searchParams.startDate;
  const endDate = searchParams.endDate;

  let data: DashboardData | null = null;
  let errorMessage: string | null = null;

  try {
    const transactionWhere: any = {};
    if (unitUsahaId) transactionWhere.unitUsahaId = unitUsahaId;
    if (startDate || endDate) {
      transactionWhere.transactionDate = {};
      if (startDate) transactionWhere.transactionDate.gte = new Date(startDate);
      if (endDate) transactionWhere.transactionDate.lte = new Date(endDate);
    }

    const letterWhere: any = {};
    if (startDate || endDate) {
      letterWhere.createdAt = {};
      if (startDate) letterWhere.createdAt.gte = new Date(startDate);
      if (endDate) letterWhere.createdAt.lte = new Date(endDate);
    }

    const [
      totalTransactions,
      totalAssets,
      totalLetters,
      pendingLetters,
    ] = await Promise.all([
      prisma.transaction.count({ where: transactionWhere }),
      prisma.asset.count(),
      prisma.letter.count({ where: letterWhere }),
      prisma.letter.count({ where: { ...letterWhere, status: "draft" } }),
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      where: transactionWhere,
      take: 5,
      orderBy: { transactionDate: "desc" },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    const recentLetters = await prisma.letter.findMany({
      where: letterWhere,
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    data = {
      stats: {
        totalTransactions,
        totalAssets,
        totalLetters,
        pendingLetters,
      },
      recentTransactions,
      recentLetters,
    };
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    errorMessage = "Gagal memuat dashboard";
  }

  let units: any[] = [];
  if (!errorMessage) {
    try {
      units = await prisma.unitUsaha.findMany({ orderBy: { name: "asc" } });
    } catch (error) {
      console.error("Error fetching units:", error);
    }
  }

  const statCards = [
    { title: "Total Transaksi", value: data?.stats.totalTransactions ?? 0, icon: Wallet, href: "/keuangan/transaksi", color: "bg-blue-50 text-blue-700" },
    { title: "Total Aset", value: data?.stats.totalAssets ?? 0, icon: Package, href: "/aset", color: "bg-green-50 text-green-700" },
    { title: "Total Surat", value: data?.stats.totalLetters ?? 0, icon: Mail, href: "/surat", color: "bg-yellow-50 text-yellow-700" },
    { title: "Surat Draft", value: data?.stats.pendingLetters ?? 0, icon: FileText, href: "/surat", color: "bg-red-50 text-red-700" },
  ];

  const filterForm = (
    <form className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Filter size={18} className="text-gray-600" />
        <h2 className="font-semibold text-gray-900">Filter</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Unit Usaha</label>
          <select
            name="unitUsahaId"
            defaultValue={unitUsahaId || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          >
            <option value="">Semua Unit Usaha</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Dari Tanggal</label>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-1">Sampai Tanggal</label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate || ""}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-600 transition"
        >
          Terapkan Filter
        </button>
        <Link
          href="/"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Reset
        </Link>
      </div>
    </form>
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang di SI-BUMDes Maju Langgeng</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 rounded border border-red-200">
          {errorMessage}
        </div>
      )}

      {filterForm}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="block p-5 bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon size={24} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            <h2 className="font-semibold text-gray-900">Transaksi Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {!data?.recentTransactions || data.recentTransactions.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Belum ada transaksi</div>
            ) : (
              data.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.transactionDate).toLocaleDateString("id-ID")}
                      {tx.unitUsahaId && ` • Unit: ${tx.unitUsahaId}`}
                    </p>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "pemasukan" ? "text-green-700" : "text-red-700"}`}>
                    {tx.type === "pemasukan" ? "+" : "-"}
                    {Number(tx.amount).toLocaleString("id-ID")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            <h2 className="font-semibold text-gray-900">Surat Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {!data?.recentLetters || data.recentLetters.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Belum ada surat</div>
            ) : (
              data.recentLetters.map((letter: any) => (
                <div key={letter.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{letter.subject}</p>
                    <p className="text-xs text-gray-500">{letter.number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${letter.status === "draft" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700"}`}>
                    {letter.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
