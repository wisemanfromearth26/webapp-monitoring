import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DollarSign, FileDown, Wallet, ChevronDown, ChevronUp, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PaymentModal = ({ driver, onPay, isOpen, onOpenChange }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
    }
  }, [isOpen]);

  const handlePay = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast({
        title: "Jumlah tidak valid",
        description: "Masukkan jumlah pembayaran yang benar.",
        variant: "destructive",
      });
      return;
    }
    if (paymentAmount > driver.remainingFee) {
        toast({
            title: "Jumlah berlebih",
            description: "Pembayaran tidak boleh melebihi sisa gaji.",
            variant: "destructive"
        });
        return;
    }
    onPay(driver.id, paymentAmount);
    onOpenChange(false);
  };

  if (!driver) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Bayar Gaji: {driver.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex justify-between">
            <span>Total Gaji Kumulatif:</span>
            <span className="font-bold">Rp {driver.fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
            <span>Telah Dibayar (Total):</span>
            <span>Rp {driver.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg">
            <span className="font-semibold">Sisa Gaji:</span>
            <span className="font-bold text-red-600">Rp {driver.remainingFee.toLocaleString()}</span>
            </div>
            <div className="space-y-2">
            <Label htmlFor="payment-amount">Jumlah Pembayaran (Rp)</Label>
            <Input
                id="payment-amount"
                type="number"
                placeholder={`Maks: ${driver.remainingFee.toLocaleString()}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            </div>
            <Button onClick={() => setAmount(driver.remainingFee.toString())} variant="link" className="p-0 h-auto">
            Bayar Lunas
            </Button>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button onClick={handlePay} className="brand-gradient text-white">
                <Wallet className="w-4 h-4 mr-2"/>
                Konfirmasi Pembayaran
            </Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  );
};

const PayrollRow = ({ driver, onPayClick, allPayments }) => {
    const [isOpen, setIsOpen] = useState(false);
    const driverPayments = allPayments.filter(p => p.driverId === driver.id).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <>
            <TableRow>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} disabled={driverPayments.length === 0}>
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                        <span className="font-medium">{driver.name}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${driver.type === 'Dedicated' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {driver.type}
                    </span>
                </TableCell>
                <TableCell className="text-right">{driver.revenue.toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold text-slate-800">{driver.fee.toLocaleString()}</TableCell>
                <TableCell className="text-right font-bold text-red-600">{driver.remainingFee.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        driver.status === 'Lunas' ? 'bg-green-100 text-green-800'
                        : driver.status === 'Belum Lunas' ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                        {driver.status}
                    </span>
                </TableCell>
                <TableCell className="text-center">
                    {driver.remainingFee > 0 && (
                        <Button size="sm" className="brand-gradient text-white" onClick={() => onPayClick(driver)}>
                            <Wallet className="w-4 h-4 mr-1"/> Bayar
                        </Button>
                    )}
                </TableCell>
            </TableRow>
            <AnimatePresence>
                {isOpen && (
                    <TableRow>
                        <TableCell colSpan={7} className="p-0">
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="bg-slate-50 overflow-hidden"
                            >
                                <div className="p-4">
                                    <h4 className="font-semibold text-md mb-2 flex items-center gap-2"><History className="w-4 h-4" /> Riwayat Pembayaran untuk {driver.name}</h4>
                                    {driverPayments.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tanggal</TableHead>
                                                    <TableHead className="text-right">Jumlah (Rp)</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {driverPayments.map(p => (
                                                    <TableRow key={p.id}>
                                                        <TableCell>{new Date(p.date).toLocaleString('id-ID')}</TableCell>
                                                        <TableCell className="text-right font-medium">{p.amount.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <p className="text-sm text-slate-500 text-center py-4">Belum ada riwayat pembayaran.</p>
                                    )}
                                </div>
                            </motion.div>
                        </TableCell>
                    </TableRow>
                )}
            </AnimatePresence>
        </>
    );
};


const PayrollManagement = ({ drivers, sales }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [payments, setPayments] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedPayments = JSON.parse(localStorage.getItem('payrollPaymentsV2')) || [];
    setPayments(savedPayments);
  }, []);

  const savePayments = (newPayments) => {
    setPayments(newPayments);
    localStorage.setItem('payrollPaymentsV2', JSON.stringify(newPayments));
  };

  const handlePayment = (driverId, amount) => {
    const newPayment = {
      id: Date.now(),
      driverId: driverId,
      amount: amount,
      date: new Date().toISOString(),
    };
    const newPayments = [...payments, newPayment];
    savePayments(newPayments);
    toast({
        title: "Pembayaran Berhasil",
        description: `Rp ${amount.toLocaleString()} telah dibayarkan kepada driver.`,
    });
  };

  const payrollData = useMemo(() => {
    const isDateRangeSet = startDate && endDate;
    
    const data = drivers.map(driver => {
      const salesForDriver = sales.filter(sale => sale.driverId === driver.id);
      
      const feeSales = isDateRangeSet ? salesForDriver.filter(sale => {
        const saleDate = new Date(sale.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        return saleDate >= start && saleDate <= end;
      }) : salesForDriver;

      const totalRevenue = feeSales.reduce((sum, sale) => sum + sale.total, 0);

      // Cumulative fee from all sales for the driver
      const cumulativeFee = salesForDriver.reduce((sum, sale) => 
        sum + sale.items.reduce((itemSum, item) => itemSum + (item.fee * item.quantity), 0), 0);
      
      const allPaymentsForDriver = payments.filter(p => p.driverId === driver.id);
      
      const paidAmount = allPaymentsForDriver.reduce((sum, p) => sum + p.amount, 0);
      
      const remainingFee = cumulativeFee - paidAmount;

      let status;
      if (cumulativeFee > 0) {
        status = remainingFee <= 0 ? 'Lunas' : 'Belum Lunas';
      } else {
        status = 'Tidak Ada Gaji';
      }

      return {
        id: driver.id,
        name: driver.name,
        type: driver.type,
        revenue: totalRevenue, // This is range-based revenue
        fee: cumulativeFee, // This is cumulative fee
        paid: paidAmount, // This is cumulative paid
        remainingFee: remainingFee > 0 ? remainingFee : 0,
        status: status
      };
    });

    return data.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [drivers, sales, startDate, endDate, searchTerm, payments]);
  
  const handleExport = (format) => {
    if (payrollData.length === 0) {
      toast({ title: "Tidak ada data untuk diekspor", variant: "destructive" });
      return;
    }
    
    const period = (startDate && endDate) ? `periode ${startDate} - ${endDate}` : 'sepanjang waktu';
    const fileName = `laporan_gaji_${period.replace(/ /g, '_')}`;

    const head = [['Nama Driver', 'Tipe', 'Total Penjualan (Periode)', 'Total Gaji (Kumulatif)', 'Total Dibayar (Kumulatif)', 'Sisa Gaji (Rp)', 'Status']];
    const body = payrollData.map(d => [
      d.name, d.type, d.revenue.toLocaleString(), d.fee.toLocaleString(), d.paid.toLocaleString(), d.remainingFee.toLocaleString(), d.status
    ]);
    const json = payrollData.map(d => ({
        'Nama Driver': d.name, 'Tipe': d.type, 'Total Penjualan (Periode)': d.revenue, 'Total Gaji (Kumulatif)': d.fee, 'Total Dibayar (Kumulatif)': d.paid, 'Sisa Gaji (Rp)': d.remainingFee, 'Status': d.status
    }));

    if (format === 'pdf') {
      const doc = new jsPDF();
      doc.text(`Laporan Gaji Driver - ${period}`, 14, 22);
      doc.autoTable({ head, body, startY: 30 });
      doc.save(`${fileName}.pdf`);
      toast({ title: "PDF Dibuat!", description: "Laporan gaji berhasil diunduh." });
    } else if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(json);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Gaji");
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      toast({ title: "Excel Dibuat!", description: "Laporan gaji berhasil diunduh." });
    }
  };

  const openPaymentModal = (driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#9bbf43]" />
                Manajemen Gaji Driver
              </div>
              <div className="flex gap-2">
                  <Button onClick={() => handleExport('pdf')} variant="outline">
                      <FileDown className="w-4 h-4 mr-2" /> PDF
                  </Button>
                  <Button onClick={() => handleExport('excel')} className="brand-gradient text-white">
                      <FileDown className="w-4 h-4 mr-2" /> Excel
                  </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchDriver">Cari Driver</Label>
                <Input
                  id="searchDriver"
                  placeholder="Masukkan nama driver..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai (Untuk Penjualan)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Selesai (Untuk Penjualan)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <p className="text-sm text-slate-500">Filter tanggal hanya memengaruhi kolom "Total Penjualan". Gaji dan status dihitung secara kumulatif.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Driver</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Total Penjualan (Periode)</TableHead>
                  <TableHead className="text-right">Total Gaji (Kumulatif)</TableHead>
                  <TableHead className="text-right">Sisa Gaji</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.length > 0 ? (
                  payrollData.map(driver => (
                    <PayrollRow
                        key={driver.id}
                        driver={driver}
                        onPayClick={openPaymentModal}
                        allPayments={payments}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <PaymentModal 
        driver={selectedDriver} 
        onPay={handlePayment}
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
};

export default PayrollManagement;