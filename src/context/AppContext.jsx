import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

const initialHospitals = [
  {
    id: 'hosp-1',
    name: 'Mehsana District Civil Hospital',
    city: 'Mehsana',
    address: 'Radhanpur Road, Near Modhera Cross Roads, Mehsana',
    departments: ['General Medicine', 'Pediatrics', 'Cardiology', 'Orthopedics'],
    doctors: [
      {
        id: 'doc-1',
        name: 'Dr. Kirit Patel',
        department: 'General Medicine',
        specialty: 'MD - Internal Medicine',
        experience: 14,
        fee: 151,
        weeklyDays: ['Mon', 'Wed', 'Fri'],
        slotsPerDay: 10,
        isActive: true
      },
      {
        id: 'doc-2',
        name: 'Dr. Hasmukh Chaudhary',
        department: 'Pediatrics',
        specialty: 'DCH - Child Specialist',
        experience: 9,
        fee: 151,
        weeklyDays: ['Tue', 'Thu', 'Sat'],
        slotsPerDay: 8,
        isActive: true
      },
      {
        id: 'doc-3',
        name: 'Dr. Pinakin Shah',
        department: 'Cardiology',
        specialty: 'DM - Cardiologist',
        experience: 16,
        fee: 151,
        weeklyDays: ['Mon', 'Tue', 'Thu'],
        slotsPerDay: 6,
        isActive: true
      }
    ]
  },
  {
    id: 'hosp-2',
    name: 'Palanpur Apex Hospital',
    city: 'Palanpur',
    address: 'Deesa Highway, Near Abu Road Highway Crossing, Palanpur',
    departments: ['General Medicine', 'Pediatrics', 'Orthopedics'],
    doctors: [
      {
        id: 'doc-4',
        name: 'Dr. Bharat Prajapati',
        department: 'General Medicine',
        specialty: 'MBBS - Family Doctor',
        experience: 7,
        fee: 151,
        weeklyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        slotsPerDay: 12,
        isActive: true
      },
      {
        id: 'doc-5',
        name: 'Dr. Ramesh Thakor',
        department: 'Orthopedics',
        specialty: 'MS - Orthopedic Surgeon',
        experience: 11,
        fee: 151,
        weeklyDays: ['Wed', 'Fri', 'Sat'],
        slotsPerDay: 8,
        isActive: true
      }
    ]
  }
];

const initialAgentProfile = {
  name: 'Dinesh Chaudhary',
  village: 'Gozaria Village',
  phone: '9876543210',
  code: 'AGT-799'
};

const initialTransactions = [
  {
    id: 'tx-1',
    date: '2026-07-25',
    type: 'credit',
    amount: 525,
    details: 'Initial wallet setup (Recharge: 500 + Bonus: 25)'
  }
];

export const AppProvider = ({ children }) => {
  const [isApiMode, setIsApiMode] = useState(false);

  const [hospitals, setHospitals] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_hospitals');
    return saved ? JSON.parse(saved) : initialHospitals;
  });

  const [agentWallet, setAgentWallet] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_wallet');
    return saved ? JSON.parse(saved) : { balance: 525, transactions: initialTransactions };
  });

  const [agentProfile, setAgentProfile] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_agent');
    return saved ? JSON.parse(saved) : initialAgentProfile;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync with MySQL if api.php is present (on production Hostinger server)
  useEffect(() => {
    fetch('./api.php?action=get_data')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setHospitals(data.hospitals);
          setAgentWallet({ balance: data.wallet_balance, transactions: data.transactions });
          setAgentProfile(data.agent_profile);
          setAppointments(data.appointments);
          setIsApiMode(true);
        }
      })
      .catch(() => {
        // Fallback silently to localStorage during local Vite dev
        setIsApiMode(false);
      });
  }, []);

  useEffect(() => {
    if (!isApiMode) {
      localStorage.setItem('dear_doctor_hospitals', JSON.stringify(hospitals));
    }
  }, [hospitals, isApiMode]);

  useEffect(() => {
    if (!isApiMode) {
      localStorage.setItem('dear_doctor_wallet', JSON.stringify(agentWallet));
    }
  }, [agentWallet, isApiMode]);

  useEffect(() => {
    if (!isApiMode) {
      localStorage.setItem('dear_doctor_agent', JSON.stringify(agentProfile));
    }
  }, [agentProfile, isApiMode]);

  useEffect(() => {
    if (!isApiMode) {
      localStorage.setItem('dear_doctor_appointments', JSON.stringify(appointments));
    }
  }, [appointments, isApiMode]);

  const refreshApiData = () => {
    fetch('./api.php?action=get_data')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setHospitals(data.hospitals);
          setAgentWallet({ balance: data.wallet_balance, transactions: data.transactions });
          setAgentProfile(data.agent_profile);
          setAppointments(data.appointments);
        }
      });
  };

  const rechargeWallet = (amount) => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    if (isApiMode) {
      fetch('./api.php?action=recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        } else {
          alert('API Recharge Failed: ' + data.message);
        }
      });
      return true;
    }

    // LocalStorage Fallback
    const bonus = Math.floor(numAmount / 500) * 25;
    const totalCredit = numAmount + bonus;

    const newTx = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'credit',
      amount: totalCredit,
      details: `Wallet Recharge (Amount: ${numAmount} + Bonus: ${bonus})`
    };

    setAgentWallet((prev) => ({
      balance: prev.balance + totalCredit,
      transactions: [newTx, ...prev.transactions]
    }));

    return true;
  };

  const getReturnCaseStatus = (patientPhone, hospitalId, department) => {
    const patientBookings = appointments.filter(
      (app) =>
        app.patientPhone === patientPhone &&
        app.hospitalId === hospitalId &&
        app.department === department &&
        app.status !== 'Canceled'
    );

    if (patientBookings.length === 0) return { isReturn: false, daysLeft: 0 };

    const dates = patientBookings.map((app) => new Date(app.date).getTime());
    const latestTime = Math.max(...dates);
    const latestDate = new Date(latestTime);

    const today = new Date();
    const diffTime = Math.abs(today - latestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) {
      return { isReturn: true, daysLeft: 30 - diffDays };
    }

    return { isReturn: false, daysLeft: 0 };
  };

  const getBookedSlotsCount = (doctorId, dateStr) => {
    return appointments.filter(
      (app) => app.doctorId === doctorId && app.date === dateStr && app.status !== 'Canceled'
    ).length;
  };

  const bookAppointment = (patientName, patientPhone, patientAge, hospitalId, doctorId, dateStr, timeSlot, useWalletPayment) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    const doctor = hospital?.doctors.find((d) => d.id === doctorId);

    if (!hospital || !doctor) return { success: false, message: 'Invalid hospital or doctor selected' };

    // Check availability slot limit locally first
    const currentBookedCount = getBookedSlotsCount(doctorId, dateStr);
    if (currentBookedCount >= doctor.slotsPerDay) {
      return { success: false, message: 'Doctor is fully booked for this day' };
    }

    // Check if appointment date falls on doctor workdays
    const bookingDate = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bookingDay = days[bookingDate.getDay()];
    if (!doctor.weeklyDays.includes(bookingDay)) {
      return { success: false, message: `Doctor is only available on: ${doctor.weeklyDays.join(', ')}` };
    }

    if (isApiMode) {
      fetch('./api.php?action=book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientAge: parseInt(patientAge, 10),
          hospitalId,
          doctorId,
          dateStr,
          timeSlot,
          useWallet: useWalletPayment
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
          // Force a local update to trigger the visual success screen
          setAppointments(prev => [data.appointment, ...prev]);
        } else {
          alert('Booking Error: ' + data.message);
        }
      });
      
      // Return a temporary success indicator, full details resolved asynchronously
      return { 
        success: true, 
        appointment: {
          id: `TK-SYNCING`,
          patientName,
          patientPhone,
          patientAge,
          hospitalId,
          hospitalName: hospital.name,
          hospitalCity: hospital.city,
          hospitalAddress: hospital.address,
          doctorId,
          doctorName: doctor.name,
          department: doctor.department,
          date: dateStr,
          timeSlot,
          status: 'Planned',
          caseType: 'Verifying...',
          feePaid: 151,
          paymentMethod: useWalletPayment ? 'Wallet' : 'Direct UPI',
          paymentId: 'syncing...',
          tokenNumber: currentBookedCount + 1,
          createdAt: new Date().toISOString()
        } 
      };
    }

    // LocalStorage Fallback logic
    const returnStatus = getReturnCaseStatus(patientPhone, hospitalId, doctor.department);
    const fee = returnStatus.isReturn ? 0 : 151;
    const caseType = returnStatus.isReturn ? 'Return Case' : 'New Case';

    let payMethod = 'Direct UPI';
    let transactionId = `pay_upi_${Date.now().toString().slice(-6)}`;

    if (fee > 0) {
      if (useWalletPayment) {
        if (agentWallet.balance < 151) {
          return { success: false, message: 'Insufficient wallet balance' };
        }
        payMethod = 'Wallet';
        transactionId = `pay_wlt_${Date.now().toString().slice(-6)}`;
        
        const newTx = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'debit',
          amount: 151,
          details: `Booking for ${patientName} (${doctor.name})`
        };

        setAgentWallet((prev) => ({
          balance: prev.balance - 151,
          transactions: [newTx, ...prev.transactions]
        }));
      }
    } else {
      payMethod = 'Waived';
      transactionId = 'waived_return_case';
    }

    const tokenNumber = currentBookedCount + 1;
    const newAppointment = {
      id: `TK-${Date.now().toString().slice(-6)}`,
      patientName,
      patientPhone,
      patientAge,
      hospitalId,
      hospitalName: hospital.name,
      hospitalCity: hospital.city,
      hospitalAddress: hospital.address,
      doctorId,
      doctorName: doctor.name,
      department: doctor.department,
      date: dateStr,
      timeSlot,
      status: 'Planned',
      caseType,
      feePaid: fee,
      paymentMethod: payMethod,
      paymentId: transactionId,
      tokenNumber,
      createdAt: new Date().toISOString()
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    return { success: true, appointment: newAppointment };
  };

  const cancelAppointment = (appointmentId) => {
    if (isApiMode) {
      fetch('./api.php?action=cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        }
      });
      return true;
    }

    const appointment = appointments.find((app) => app.id === appointmentId);
    if (!appointment) return false;

    if (appointment.status !== 'Canceled' && appointment.feePaid > 0 && appointment.paymentMethod === 'Wallet') {
      const refundTx = {
        id: `tx-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'credit',
        amount: appointment.feePaid,
        details: `Refund for canceled booking ${appointment.id}`
      };

      setAgentWallet((prev) => ({
        balance: prev.balance + appointment.feePaid,
        transactions: [refundTx, ...prev.transactions]
      }));
    }

    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, status: 'Canceled' } : app))
    );
    return true;
  };

  const completeAppointment = (appointmentId) => {
    if (isApiMode) {
      fetch('./api.php?action=complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        }
      });
      return true;
    }

    setAppointments((prev) =>
      prev.map((app) => (app.id === appointmentId ? { ...app, status: 'Completed' } : app))
    );
    return true;
  };

  const addDoctor = (hospitalId, newDoc) => {
    if (isApiMode) {
      fetch('./api.php?action=doctor_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          name: newDoc.name,
          department: newDoc.department,
          specialty: newDoc.specialty,
          experience: newDoc.experience,
          slotsPerDay: newDoc.slotsPerDay,
          weeklyDays: newDoc.weeklyDays,
          isActive: 1
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        }
      });
      return true;
    }

    setHospitals((prev) =>
      prev.map((hosp) => {
        if (hosp.id === hospitalId) {
          const docToAdd = {
            id: `doc-${Date.now()}`,
            isActive: true,
            fee: 151,
            ...newDoc
          };
          return { ...hosp, doctors: [...hosp.doctors, docToAdd] };
        }
        return hosp;
      })
    );
    return true;
  };

  const editDoctor = (hospitalId, doctorId, updatedFields) => {
    if (isApiMode) {
      fetch('./api.php?action=doctor_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          doctorId,
          name: updatedFields.name,
          department: updatedFields.department,
          specialty: updatedFields.specialty,
          experience: updatedFields.experience,
          slotsPerDay: updatedFields.slotsPerDay,
          weeklyDays: updatedFields.weeklyDays,
          isActive: updatedFields.isActive ? 1 : 0
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        }
      });
      return true;
    }

    setHospitals((prev) =>
      prev.map((hosp) => {
        if (hosp.id === hospitalId) {
          return {
            ...hosp,
            doctors: hosp.doctors.map((doc) =>
              doc.id === doctorId ? { ...doc, ...updatedFields } : doc
            )
          };
        }
        return hosp;
      })
    );
    return true;
  };

  const deleteDoctor = (hospitalId, doctorId) => {
    if (isApiMode) {
      // Delete acts as disabling the doctor status in simple db update
      editDoctor(hospitalId, doctorId, { isActive: false });
      return true;
    }

    setHospitals((prev) =>
      prev.map((hosp) => {
        if (hosp.id === hospitalId) {
          return {
            ...hosp,
            doctors: hosp.doctors.filter((doc) => doc.id !== doctorId)
          };
        }
        return hosp;
      })
    );
    return true;
  };

  const reassignDoctorBookings = (hospitalId, fromDoctorId, toDoctorId) => {
    const targetDoctor = hospitals
      .find((h) => h.id === hospitalId)
      ?.doctors.find((d) => d.id === toDoctorId);

    if (!targetDoctor) return false;

    setAppointments((prev) =>
      prev.map((app) => {
        if (app.hospitalId === hospitalId && app.doctorId === fromDoctorId && app.status === 'Planned') {
          return {
            ...app,
            doctorId: toDoctorId,
            doctorName: targetDoctor.name,
            department: targetDoctor.department
          };
        }
        return app;
      })
    );
    return true;
  };

  const updateAgentProfile = (updatedProfile) => {
    if (isApiMode) {
      fetch('./api.php?action=profile_update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: updatedProfile.name,
          village: updatedProfile.village,
          phone: updatedProfile.phone
        })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        }
      });
      return true;
    }

    setAgentProfile((prev) => ({ ...prev, ...updatedProfile }));
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        hospitals,
        agentWallet,
        agentProfile,
        appointments,
        rechargeWallet,
        getReturnCaseStatus,
        getBookedSlotsCount,
        bookAppointment,
        cancelAppointment,
        completeAppointment,
        addDoctor,
        editDoctor,
        deleteDoctor,
        reassignDoctorBookings,
        updateAgentProfile
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
