import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToStream } from "@react-pdf/renderer";
import { Readable } from "stream";

export interface ExportData {
  reportType: string;
  data: any[];
  startDate?: string;
  endDate?: string;
  title?: string;
}

const styles = StyleSheet.create({
  page: { padding: 50, fontSize: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  subtitle: { fontSize: 10, marginBottom: 5, textAlign: "center" },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#ccc", paddingVertical: 3 },
  tableCell: { fontSize: 8, flex: 1, paddingHorizontal: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#000", paddingVertical: 3, backgroundColor: "#f0f0f0" },
  tableHeaderCell: { fontSize: 8, flex: 1, fontWeight: "bold", paddingHorizontal: 4 },
  label: { fontSize: 9, marginTop: 15 },
});

export async function generateReportPDF({ reportType, data, startDate, endDate, title }: ExportData): Promise<Readable> {
  const MyDocument = () => (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{title || "Laporan SI-BUMDes"}</Text>
        <Text style={styles.subtitle}>Tanggal cetak: {new Date().toLocaleDateString("id-ID")}</Text>
        {startDate && endDate && (
          <Text style={styles.subtitle}>Periode: {startDate} sampai {endDate}</Text>
        )}
        <Text style={styles.subtitle}>Total data: {data.length} baris</Text>

        {reportType === "transaksi" && (
          <>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 0.5 }}>No</Text>
              <Text style={styles.tableHeaderCell}>Kode Akun</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Keterangan</Text>
              <Text style={styles.tableHeaderCell}>Tanggal</Text>
              <Text style={styles.tableHeaderCell}>Jenis</Text>
              <Text style={styles.tableHeaderCell}>Nominal</Text>
            </View>
            {data.slice(0, 25).map((item: any, i: number) => (
              <View key={item.id || i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, flex: 0.5 }}>{i + 1}</Text>
                <Text style={styles.tableCell}>{item.accountCode || "-"}</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{item.description || "-"}</Text>
                <Text style={styles.tableCell}>
                  {item.transactionDate ? new Date(item.transactionDate).toLocaleDateString("id-ID") : "-"}
                </Text>
                <Text style={styles.tableCell}>
                  {item.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                </Text>
                <Text style={styles.tableCell}>
                  {Number(item.amount).toLocaleString("id-ID")}
                </Text>
              </View>
            ))}
          </>
        )}

        {reportType === "aset" && (
          <>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 0.5 }}>No</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Nama</Text>
              <Text style={styles.tableHeaderCell}>Kategori</Text>
              <Text style={styles.tableHeaderCell}>Tgl Perolehan</Text>
              <Text style={styles.tableHeaderCell}>Nilai</Text>
              <Text style={styles.tableHeaderCell}>Kondisi</Text>
            </View>
            {data.slice(0, 25).map((item: any, i: number) => (
              <View key={item.id || i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, flex: 0.5 }}>{i + 1}</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{item.name || "-"}</Text>
                <Text style={styles.tableCell}>{item.category || "-"}</Text>
                <Text style={styles.tableCell}>
                  {item.acquisitionDate ? new Date(item.acquisitionDate).toLocaleDateString("id-ID") : "-"}
                </Text>
                <Text style={styles.tableCell}>
                  {item.acquisitionValue ? Number(item.acquisitionValue).toLocaleString("id-ID") : "-"}
                </Text>
                <Text style={styles.tableCell}>{item.condition || "-"}</Text>
              </View>
            ))}
          </>
        )}

        {reportType === "surat" && (
          <>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 0.5 }}>No</Text>
              <Text style={styles.tableHeaderCell}>Nomor</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Perihal</Text>
              <Text style={styles.tableHeaderCell}>Tanggal</Text>
              <Text style={styles.tableHeaderCell}>Status</Text>
            </View>
            {data.slice(0, 25).map((item: any, i: number) => (
              <View key={item.id || i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, flex: 0.5 }}>{i + 1}</Text>
                <Text style={styles.tableCell}>{item.number || "-"}</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{item.subject || "-"}</Text>
                <Text style={styles.tableCell}>
                  {item.outgoingDate
                    ? new Date(item.outgoingDate).toLocaleDateString("id-ID")
                    : item.incomingDate
                    ? new Date(item.incomingDate).toLocaleDateString("id-ID")
                    : "-"}
                </Text>
                <Text style={styles.tableCell}>{item.status || "-"}</Text>
              </View>
            ))}
          </>
        )}

        {reportType === "penyusutan" && (
          <>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 0.5 }}>No</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Nama Aset</Text>
              <Text style={styles.tableHeaderCell}>Kategori</Text>
              <Text style={styles.tableHeaderCell}>Periode</Text>
              <Text style={styles.tableHeaderCell}>Jumlah Penyusutan</Text>
              <Text style={styles.tableHeaderCell}>Status</Text>
            </View>
            {data.slice(0, 25).map((item: any, i: number) => (
              <View key={item.id || i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCell, flex: 0.5 }}>{i + 1}</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{item.asset?.name || "-"}</Text>
                <Text style={styles.tableCell}>{item.asset?.category || "-"}</Text>
                <Text style={styles.tableCell}>{item.period || "-"}</Text>
                <Text style={styles.tableCell}>
                  {item.amount ? Number(item.amount).toLocaleString("id-ID") : "-"}
                </Text>
                <Text style={styles.tableCell}>
                  {item.isAccrued ? "Diterapkan" : "Draft"}
                </Text>
              </View>
            ))}
          </>
        )}

        {data.length > 25 && (
          <Text style={styles.label}>... dan {data.length - 25} data lagi</Text>
        )}
      </Page>
    </Document>
  );

  const stream = await renderToStream(<MyDocument />);
  return new Promise<Readable>((resolve, reject) => {
    const readable = new Readable({ read() {} });
    stream.on("data", (chunk: Buffer) => readable.push(chunk));
    stream.on("end", () => {
      readable.push(null);
      resolve(readable);
    });
    stream.on("error", reject);
  });
}
