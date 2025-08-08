import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sales, setSales] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    initializeData();
    const cleanup = setupAutoReset();
    return () => cleanup();
  }, []);

  const setupAutoReset = () => {
    let intervalId;
    
    // Setup listener untuk pengaturan
    const unsubscribe = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const settings = snapshot.docs[0]?.data() || {};
      
      // Clear existing interval if any
      if (intervalId) {
        clearInterval(intervalId);
      }
      
      if (!settings.isAutoResetEnabled) return;

      const checkAndResetDaily = async () => {
        try {
          const now = new Date();
          const [hours, minutes] = settings.autoResetTime.split(':');
          const resetTime = new Date();
          resetTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          if (now >= resetTime) {
            const today = now.toISOString().split('T')[0];
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            // Create a batch for atomic operations
            const batch = writeBatch(db);

            // Get yesterday's data
            const salesQuery = query(collection(db, 'sales'), where('date', '==', yesterdayStr));
            const attendanceQuery = query(collection(db, 'attendance'), where('date', '==', yesterdayStr));
            
            const [salesDocs, attendanceDocs] = await Promise.all([
              getDocs(salesQuery),
              getDocs(attendanceQuery)
            ]);

            // Move to historical collections and delete originals
            const salesPromises = salesDocs.docs.map(async (doc) => {
              const data = doc.data();
              const histRef = await addDoc(collection(db, 'historicalSales'), data);
              batch.delete(doc.ref);
              return histRef;
            });

            const attendancePromises = attendanceDocs.docs.map(async (doc) => {
              const data = doc.data();
              const histRef = await addDoc(collection(db, 'historicalAttendance'), data);
              batch.delete(doc.ref);
              return histRef;
            });

            // Wait for all historical data to be saved
            await Promise.all([...salesPromises, ...attendancePromises]);
            
            // Commit the batch to delete original documents
            await batch.commit();
          }
        } catch (error) {
          console.error('Error in checkAndResetDaily:', error);
        }
      };

      // Start checking every minute
      intervalId = setInterval(checkAndResetDaily, 60000);
    });

    // Cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      unsubscribe();
    };
  };

  const initializeData = async () => {
    try {
      // Setup realtime listeners untuk setiap koleksi
      onSnapshot(collection(db, 'products'), (snapshot) => {
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(products);
      });

      onSnapshot(collection(db, 'drivers'), (snapshot) => {
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDrivers(drivers);
      });

      onSnapshot(collection(db, 'locations'), (snapshot) => {
        const locations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLocations(locations);
      });

      onSnapshot(collection(db, 'sales'), (snapshot) => {
        const sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSales(sales);
      });

      onSnapshot(collection(db, 'attendance'), (snapshot) => {
        const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAttendance(attendance);
      });

      onSnapshot(collection(db, 'schedule'), (snapshot) => {
        const schedules = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSchedule(schedules[0] || null); // Ambil jadwal terbaru
      });

      // Initialize settings if they don't exist
      const settingsSnapshot = await getDocs(collection(db, 'settings'));
      if (settingsSnapshot.empty) {
        const defaultSettings = {
          companyName: 'Driver Sales Monitoring',
          logo: '',
          primaryColor: '#0ea5e9',
          secondaryColor: '#64748b',
          currency: 'IDR',
          autoResetEnabled: false,
          autoResetTime: '00:00',
          payrollDate: 1,
          minimumAttendance: 20,
          bonusThreshold: 100000,
          bonusAmount: 50000,
          baseSalary: 3000000,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'settings'), defaultSettings);
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };
  
  const factoryReset = async () => {
    try {
      // Delete all data from each collection
      const collections = [
        'products',
        'drivers',
        'locations',
        'sales',
        'attendance',
        'schedule',
        'settings',
        'historicalSales',
        'historicalAttendance'
      ];

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      // Reset local state
      setProducts([]);
      setDrivers([]);
      setLocations([]);
      setSales([]);
      setAttendance([]);
      setSchedule(null);
    } catch (error) {
      console.error('Error in factory reset:', error);
      throw error;
    }
  };

  const addProduct = async (product) => {
    try {
      console.log('Adding product to Firestore:', product);
      const productData = {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'products'), productData);
      console.log('Product added successfully with ID:', docRef.id);
      return { id: docRef.id, ...productData };
    } catch (error) {
      console.error('Error adding product:', error);
      console.error('Error details:', error.code, error.message);
      throw error;
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const productRef = doc(db, 'products', id);
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(productRef, updatedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const addDriver = async (driver) => {
    try {
      const newDriver = { ...driver, isActive: true };
      const docRef = await addDoc(collection(db, 'drivers'), newDriver);
      return { id: docRef.id, ...newDriver };
    } catch (error) {
      console.error('Error adding driver:', error);
      throw error;
    }
  };

  const updateDriver = async (id, updates) => {
    try {
      const driverRef = doc(db, 'drivers', id);
      // If password is empty, remove it from updates to keep existing password
      if (!updates.password || updates.password === '') {
        delete updates.password;
      }
      await updateDoc(driverRef, updates);
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  };

  const deleteDriver = async (id) => {
    try {
      const driverRef = doc(db, 'drivers', id);
      await updateDoc(driverRef, { isActive: false });
    } catch (error) {
      console.error('Error deactivating driver:', error);
      throw error;
    }
  };

  const addLocation = async (location) => {
    try {
      const docRef = await addDoc(collection(db, 'locations'), location);
      return { id: docRef.id, ...location };
    } catch (error) {
      console.error('Error adding location:', error);
      throw error;
    }
  };

  const updateLocation = async (id, updates) => {
    try {
      const locationRef = doc(db, 'locations', id);
      await updateDoc(locationRef, updates);
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  };

  const deleteLocation = async (id) => {
    try {
      await deleteDoc(doc(db, 'locations', id));
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  };

  const addSale = async (sale) => {
    try {
      const newSale = { 
        driverId: sale.driverId,
        location: sale.location,
        items: sale.items,
        total: sale.total,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      
      const docRef = await addDoc(collection(db, 'sales'), newSale);
      const saleWithId = { ...newSale, id: docRef.id };
      return saleWithId;
    } catch (error) {
      console.error('Error adding sale:', error);
      throw error;
    }
  };

  const updateSale = async (id, updates) => {
    try {
      const saleRef = doc(db, 'sales', id);
      await updateDoc(saleRef, updates);
    } catch (error) {
      console.error('Error updating sale:', error);
      throw error;
    }
  };

  const deleteSale = async (id) => {
    try {
      await deleteDoc(doc(db, 'sales', id));
    } catch (error) {
      console.error('Error deleting sale:', error);
      throw error;
    }
  };

  const addAttendance = async (attendanceRecord) => {
    try {
      const newAttendance = { 
        driverId: attendanceRecord.driverId,
        location: attendanceRecord.location,
        type: attendanceRecord.type,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString().split('T')[0]
      };
      
      const docRef = await addDoc(collection(db, 'attendance'), newAttendance);
      const attendanceWithId = { ...newAttendance, id: docRef.id };
      return attendanceWithId;
    } catch (error) {
      console.error('Error adding attendance:', error);
      throw error;
    }
  };

  const updateAttendance = async (id, updates) => {
    try {
      const attendanceRef = doc(db, 'attendance', id);
      await updateDoc(attendanceRef, updates);
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  };

  const resetTodayData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get today's sales and attendance
      const salesQuery = query(collection(db, 'sales'), where('date', '==', today));
      const attendanceQuery = query(collection(db, 'attendance'), where('date', '==', today));
      
      const [salesDocs, attendanceDocs] = await Promise.all([
        getDocs(salesQuery),
        getDocs(attendanceQuery)
      ]);

      // Delete all today's documents
      const deletePromises = [
        ...salesDocs.docs.map(doc => deleteDoc(doc.ref)),
        ...attendanceDocs.docs.map(doc => deleteDoc(doc.ref))
      ];

      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error resetting today data:', error);
      throw error;
    }
  };

  const generateSchedule = async (interval, excludedDays = []) => {
    try {
      const dedicatedDrivers = drivers.filter(d => d.type === 'Dedicated' && d.isActive);

      if (dedicatedDrivers.length === 0 || locations.length === 0) {
        return;
      }

      const newSchedule = [];
      const today = new Date();
      let shuffledDrivers = [...dedicatedDrivers].sort(() => Math.random() - 0.5);
      let workingDaysCount = 0;

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay();

        const daySchedule = { date: dateString, assignments: [] };

        if (!excludedDays.includes(dayOfWeek)) {
          workingDaysCount++;
          if (workingDaysCount > 1 && (workingDaysCount - 1) % interval === 0) {
            const lastDriver = shuffledDrivers.pop();
            shuffledDrivers.unshift(lastDriver);
          }

          const dailyLocations = [...locations].sort(() => Math.random() - 0.5);
          
          shuffledDrivers.forEach((driver, j) => {
            const location = dailyLocations[j % dailyLocations.length];
            daySchedule.assignments.push({
              driverId: driver.id,
              driverName: driver.name,
              locationId: location.id,
              locationName: location.name,
            });
          });
        }
        
        newSchedule.push(daySchedule);
      }

      // Save schedule to Firestore
      await addDoc(collection(db, 'schedule'), { 
        createdAt: new Date().toISOString(),
        schedule: newSchedule 
      });

    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error;
    }
  };

  const resetSchedule = async () => {
    try {
      const scheduleQuery = query(collection(db, 'schedule'));
      const scheduleDocs = await getDocs(scheduleQuery);
      
      // Delete all schedule documents
      const deletePromises = scheduleDocs.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      
      setSchedule(null);
    } catch (error) {
      console.error('Error resetting schedule:', error);
      throw error;
    }
  };

  const getHistoricalData = async (startDate, endDate) => {
    try {
      let salesQuery = collection(db, 'sales');
      let attendanceQuery = collection(db, 'attendance');

      if (startDate && endDate) {
        salesQuery = query(salesQuery, 
          where('date', '>=', startDate), 
          where('date', '<=', endDate)
        );
        attendanceQuery = query(attendanceQuery, 
          where('date', '>=', startDate), 
          where('date', '<=', endDate)
        );
      }

      const [salesDocs, attendanceDocs] = await Promise.all([
        getDocs(salesQuery),
        getDocs(attendanceQuery)
      ]);

      return {
        sales: salesDocs.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        attendance: attendanceDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      };
    } catch (error) {
      console.error('Error getting historical data:', error);
      throw error;
    }
  };

  const generatePayroll = async (driverId, period) => {
    try {
      // Get all sales for the driver in the period
      const [year, month] = period.split('-');
      const startDate = `${period}-01`;
      const endDate = `${period}-${new Date(parseInt(year), parseInt(month), 0).getDate()}`;
      
      const salesQuery = query(
        collection(db, 'sales'),
        where('driverId', '==', driverId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('driverId', '==', driverId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );

      const [salesDocs, attendanceDocs, settingsDocs] = await Promise.all([
        getDocs(salesQuery),
        getDocs(attendanceQuery),
        getDocs(collection(db, 'settings'))
      ]);

      const settings = settingsDocs.docs[0]?.data() || {};
      const driver = drivers.find(d => d.id === driverId);

      if (!driver) throw new Error('Driver not found');

      // Calculate total fees from sales
      const totalFee = salesDocs.docs.reduce((sum, doc) => {
        const sale = doc.data();
        return sum + (sale.totalFee || 0);
      }, 0);

      // Calculate attendance bonus
      const uniqueDates = new Set(attendanceDocs.docs.map(doc => doc.data().date));
      const daysPresent = uniqueDates.size;
      const bonus = daysPresent >= (settings.minimumAttendance || 20) ? (settings.bonusAmount || 0) : 0;

      const payrollData = {
        driverId,
        driverName: driver.name,
        period,
        baseSalary: driver.type === 'Dedicated' ? (settings.baseSalary || 0) : 0,
        totalFee,
        bonus,
        deductions: 0,
        netSalary: (driver.type === 'Dedicated' ? (settings.baseSalary || 0) : 0) + totalFee + bonus,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'payroll'), payrollData);
      return { id: docRef.id, ...payrollData };
    } catch (error) {
      console.error('Error generating payroll:', error);
      throw error;
    }
  };

  const updatePayrollStatus = async (payrollId, status) => {
    try {
      const payrollRef = doc(db, 'payroll', payrollId);
      const updates = {
        status,
        updatedAt: new Date().toISOString()
      };
      
      if (status === 'paid') {
        updates.paidAt = new Date().toISOString();
      }
      
      await updateDoc(payrollRef, updates);
    } catch (error) {
      console.error('Error updating payroll status:', error);
      throw error;
    }
  };

  const value = {
    products,
    drivers,
    locations,
    sales,
    attendance,
    schedule,
    addProduct,
    updateProduct,
    deleteProduct,
    addDriver,
    updateDriver,
    deleteDriver,
    addLocation,
    updateLocation,
    deleteLocation,
    addSale,
    updateSale,
    deleteSale,
    addAttendance,
    updateAttendance,
    resetTodayData,
    generateSchedule,
    resetSchedule,
    factoryReset,
    getHistoricalData,
    generatePayroll,
    updatePayrollStatus
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
