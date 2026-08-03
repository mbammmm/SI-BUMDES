import Link from "next/link";
import { Wallet, Package, Mail, FileText, TrendingUp } from "lucide-react";
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

export default async function DashboardPage() {
  let data: DashboardData | null = null;
  let errorMessage: string | null = null;

  try {
    const [
      totalTransactions,
      totalAssets,
      totalLetters,
      pendingLetters,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.asset.count(),
      prisma.letter.count(),
      prisma.letter.count({ where: { status: "draft" } }),
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      take: 5,
      orderBy: { transactionDate: "desc" },
      include: {
        createdBy: { select: { name: true } },
      },
    });

    const recentLetters = await prisma.letter.findMany({
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

  const statCards = [
    { title: "Total Transaksi", value: data?.stats.totalTransactions ?? 0, icon: Wallet, href: "/keuangan/transaksi", color: "bg-blue-50 text-blue-700" },
    { title: "Total Aset", value: data?.stats.totalAssets ?? 0, icon: Package, href: "/aset", color: "bg-green-50 text-green-700" },
    { title: "Total Surat", value: data?.stats.totalLetters ?? 0, icon: Mail, href: "/surat", color: "bg-yellow-50 text-yellow-700" },
    { title: "Surat Draft", value: data?.stats.pendingLetters ?? 0, icon: FileText, href: "/surat", color: "bg-red-50 text-red-700" },
  ];

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
