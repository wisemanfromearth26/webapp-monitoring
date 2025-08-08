import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { FileDown, FileType } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportGenerator = ({ sales, attendance, drivers, locations, products, schedule, stats, chartData }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('sales');

  const getDriverName = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    return driver ? driver.name : `Driver (ID: ${driverId})`;
  };

  const filterDataByDate = (data) => {
    if (!startDate || !endDate) return data;
    return data.filter(item => {
      const itemDate = new Date(item.date || item.timestamp);
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return itemDate >= start && itemDate <= end;
    });
  };

  const calculatePayroll = (filteredSales) => {
    const payrollData = {};
    filteredSales.forEach(sale => {
      if (!payrollData[sale.driverId]) {
        payrollData[sale.driverId] = {
          name: getDriverName(sale.driverId),
          sales: 0,
          revenue: 0,
          fee: 0,
        };
      }
      payrollData[sale.driverId].sales += 1;
      payrollData[sale.driverId].revenue += sale.total;
      payrollData[sale.driverId].fee += sale.items.reduce((sum, item) => sum + (item.fee * item.quantity), 0);
    });
    return Object.values(payrollData);
  };

  const calculateAttendanceStats = (filteredAttendance) => {
    const stats = {};
    filteredAttendance.forEach(att => {
      if (!stats[att.driverId]) {
        stats[att.driverId] = {
          name: getDriverName(att.driverId),
          shifts: [],
          totalHours: 0,
          shiftCount: 0,
        };
      }
      stats[att.driverId].shifts.push({ type: att.type, time: new Date(att.timestamp) });
    });

    for (const driverId in stats) {
      const driverShifts = stats[driverId].shifts.sort((a, b) => a.time - b.time);
      let startShiftTime = null;
      for (const shift of driverShifts) {
        if (shift.type === 'start' && !startShiftTime) {
          startShiftTime = shift.time;
        } else if (shift.type === 'end' && startShiftTime) {
          const duration = (shift.time - startShiftTime) / (1000 * 60 * 60);
          stats[driverId].totalHours += duration;
          stats[driverId].shiftCount += 1;
          startShiftTime = null;
        }
      }
    }

    return Object.values(stats).map(s => ({
      ...s,
      avgHours: s.shiftCount > 0 ? (s.totalHours / s.shiftCount).toFixed(2) : 0,
      totalHours: s.totalHours.toFixed(2),
    }));
  };

  const handleExport = (format) => {
    if (reportType !== 'stats' && (!startDate || !endDate)) {
      toast({
        title: "Rentang Tanggal Diperlukan",
        description: "Silakan pilih tanggal mulai dan selesai untuk membuat laporan.",
        variant: "destructive",
      });
      return;
    }

    const dateRangeText = `Periode: ${startDate} s/d ${endDate}`;
    const fileName = `laporan_${reportType}_${startDate}_${endDate}`;

    if (format === 'pdf') {
      if (reportType === 'stats') {
        toast({ title: "Tidak Tersedia", description: "Laporan statistik hanya tersedia dalam format Excel.", variant: "destructive" });
        return;
      }
      generatePdf(dateRangeText, fileName);
    } else if (format === 'excel') {
      generateExcel(fileName);
    }
  };

  const generatePdf = (dateRangeText, fileName) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Laporan ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 14, 22);
    doc.setFontSize(11);
    doc.text(dateRangeText, 14, 30);

    let head = [];
    let body = [];

    switch (reportType) {
      case 'sales':
        head = [['Tanggal', 'Driver', 'Lokasi', 'Produk', 'Jumlah', 'Total (Rp)']];
        const filteredSales = filterDataByDate(sales);
        filteredSales.forEach(sale => {
          body.push([
            sale.date,
            getDriverName(sale.driverId),
            sale.location,
            sale.items.map(i => i.name).join(', '),
            sale.items.reduce((sum, i) => sum + i.quantity, 0),
            sale.total.toLocaleString()
          ]);
        });
        break;
      case 'attendance':
        head = [['Driver', 'Total Jam Kerja', 'Jumlah Shift', 'Rata-rata Jam/Shift']];
        const attendanceStats = calculateAttendanceStats(filterDataByDate(attendance));
        attendanceStats.forEach(stat => {
          body.push([stat.name, stat.totalHours, stat.shiftCount, stat.avgHours]);
        });
        break;
      case 'payroll':
        head = [['Driver', 'Total Penjualan (Rp)', 'Total Transaksi', 'Total Gaji (Rp)']];
        const payrollData = calculatePayroll(filterDataByDate(sales));
        payrollData.forEach(d => {
          body.push([d.name, d.revenue.toLocaleString(), d.sales, d.fee.toLocaleString()]);
        });
        break;
      default:
        return;
    }

    doc.autoTable({ startY: 35, head, body, theme: 'grid', styles: { fontSize: 8 } });
    doc.save(`${fileName}.pdf`);
    toast({ title: "PDF Dibuat!", description: "Laporan PDF berhasil diunduh." });
  };

  const generateExcel = (fileName) => {
    const wb = XLSX.utils.book_new();
    
    if (reportType === 'stats') {
      const summaryData = [
        { Kategori: 'Pendapatan Hari Ini', Nilai: stats.todayRevenue },
        { Kategori: 'Transaksi Hari Ini', Nilai: stats.todaySales },
        { Kategori: 'Driver Aktif Hari Ini', Nilai: stats.activeDrivers },
        { Kategori: 'Total Driver Aktif', Nilai: stats.totalDrivers },
        { Kategori: 'Total Produk', Nilai: stats.totalProducts },
      ];
      const summaryWs = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, summaryWs, "Ringkasan");

      const salesChartWs = XLSX.utils.json_to_sheet(chartData.salesChartData);
      XLSX.utils.book_append_sheet(wb, salesChartWs, "Penjualan 7 Hari");

      const topProductsData = Object.entries(stats.productSales || {})
        .sort(([, a], [, b]) => b.revenue - a.revenue)
        .map(([name, data]) => ({ 'Nama Produk': name, 'Jumlah Terjual': data.quantity, 'Total Pendapatan (Rp)': data.revenue }));
      const topProductsWs = XLSX.utils.json_to_sheet(topProductsData);
      XLSX.utils.book_append_sheet(wb, topProductsWs, "Produk Terlaris");

      const driverPerfWs = XLSX.utils.json_to_sheet(chartData.driverPerformanceData.map(d => ({'Nama Driver': d.name, 'Total Transaksi': d.sales, 'Total Pendapatan (Rp)': d.revenue, 'Total Gaji (Rp)': d.fee})));
      XLSX.utils.book_append_sheet(wb, driverPerfWs, "Performa Driver Teratas");

      const topLocationsWs = XLSX.utils.json_to_sheet(chartData.topLocationsData.map(l => ({'Nama Lokasi': l.name, 'Total Transaksi': l.sales, 'Total Pendapatan (Rp)': l.revenue})));
      XLSX.utils.book_append_sheet(wb, topLocationsWs, "Lokasi Paling Ramai");
      
      const peakHoursWs = XLSX.utils.json_to_sheet(stats.peakHoursPerformance.map(h => ({'Jam': h.hour, 'Total Transaksi': h.sales, 'Total Pendapatan (Rp)': h.revenue})));
      XLSX.utils.book_append_sheet(wb, peakHoursWs, "Jam Paling Ramai");

      const busiestDaysWs = XLSX.utils.json_to_sheet(stats.busiestDaysPerformance.map(d => ({'Tanggal': d.date, 'Total Transaksi': d.sales, 'Total Pendapatan (Rp)': d.revenue})));
      XLSX.utils.book_append_sheet(wb, busiestDaysWs, "Hari Paling Ramai");

      XLSX.writeFile(wb, `laporan_statistik_dashboard.xlsx`);
      toast({ title: "Excel Dibuat!", description: "Laporan statistik dashboard berhasil diunduh." });
      return;
    }

    let ws;
    switch (reportType) {
      case 'sales':
        const salesData = filterDataByDate(sales).map(s => ({
          Tanggal: s.date,
          Driver: getDriverName(s.driverId),
          Lokasi: s.location,
          'Total (Rp)': s.total,
          Produk: s.items.map(i => `${i.name} (x${i.quantity})`).join(', ')
        }));
        ws = XLSX.utils.json_to_sheet(salesData);
        break;
      case 'attendance':
        const attendanceData = calculateAttendanceStats(filterDataByDate(attendance)).map(stat => ({
          Driver: stat.name,
          'Total Jam Kerja': parseFloat(stat.totalHours),
          'Jumlah Shift': stat.shiftCount,
          'Rata-rata Jam/Shift': parseFloat(stat.avgHours),
        }));
        ws = XLSX.utils.json_to_sheet(attendanceData);
        break;
      case 'payroll':
        const payrollData = calculatePayroll(filterDataByDate(sales)).map(d => ({
          'Nama Driver': d.name,
          'Total Penjualan (Rp)': d.revenue,
          'Total Transaksi': d.sales,
          'Total Gaji (Rp)': d.fee,
        }));
        ws = XLSX.utils.json_to_sheet(payrollData);
        break;
      default:
        return;
    }

    XLSX.utils.book_append_sheet(wb, ws, `Laporan ${reportType}`);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    toast({ title: "Excel Dibuat!", description: "Laporan Excel berhasil diunduh." });
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileDown className="w-5 h-5 text-[#9bbf43]" />
          Buat Laporan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="reportType">Tipe Laporan</Label>
            <select
              id="reportType"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="sales">Penjualan</option>
              <option value="attendance">Presensi</option>
              <option value="payroll">Gaji</option>
              <option value="stats">Statistik Dashboard</option>
            </select>
          </div>
          <div className="space-y-2" style={{ display: reportType === 'stats' ? 'none' : 'block' }}>
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2" style={{ display: reportType === 'stats' ? 'none' : 'block' }}>
            <Label htmlFor="endDate">Tanggal Selesai</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex gap-2" style={{ gridColumn: reportType === 'stats' ? 'span 3' : 'auto' }}>
            <Button onClick={() => handleExport('pdf')} className="flex-1" variant="outline" disabled={reportType === 'stats'}>
              <FileType className="w-4 h-4 mr-2" /> PDF
            </Button>
            <Button onClick={() => handleExport('excel')} className="flex-1 brand-gradient text-white">
              <FileType className="w-4 h-4 mr-2" /> Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;