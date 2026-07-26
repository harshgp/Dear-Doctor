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

const initialAllAgents = [
  { id: 1, name: 'Dinesh Chaudhary', village: 'Gozaria Village', phone: '9876543210', code: 'AGT-799', status: 'approved', wallet_balance: 525 },
  { id: 2, name: 'Karan Patel', village: 'Visnagar Rural', phone: '9825123456', code: 'AGT-802', status: 'pending', wallet_balance: 0 }
];

// Simple Gujarati translations dictionary mappings
const guTranslations = {
  'dear doctor': 'વ્હાલા ડોક્ટર',
  'north gujarat network': 'ઉત્તર ગુજરાત નેટવર્ક',
  'village agent wallet': 'ગ્રામ્ય એજન્ટ પાકીટ',
  '1. patient details': '૧. દર્દીની વિગતો',
  'new patient': 'નવા દર્દી',
  'registered villager': 'નોંધાયેલા ગ્રામજન',
  'full name': 'આખું નામ',
  'phone number': 'મોબાઈલ નંબર',
  'age': 'ઉંમર',
  'gender': 'જાતિ',
  'male': 'પુરુષ',
  'female': 'સ્ત્રી',
  'patient ailment': 'દર્દીની તકલીફ / રોગ',
  'enter patient problem': 'દર્દીની તકલીફ લખો (જેમકે તાવ, આંખનો દુખાવો)',
  'listening': 'સાંભળી રહ્યા છીએ',
  'speak now': 'હવે બોલો',
  'register': 'નોંધણી કરો',
  'select villager patient': 'નોંધાયેલા દર્દી પસંદ કરો',
  '2. select center & doctor': '૨. હોસ્પિટલ અને ડોક્ટર પસંદ કરો',
  'select doctor': 'ડોક્ટર પસંદ કરો',
  'available days': 'ઉપલબ્ધ દિવસો',
  'limit': 'મર્યાદા',
  'per day': 'દિવસ દીઠ',
  '3. pick date': '૩. તારીખ પસંદ કરો',
  'available timings': 'ઉપલબ્ધ સમય',
  'verified return case! previous visit was within 30 days. no token fee (fee: 0) will be charged.': 'પરત દર્દી ચકાસાયેલ છે! અગાઉની મુલાકાત ૩૦ દિવસની અંદર હતી. કોઈ ફી લેવામાં આવશે નહીં.',
  'token consultation charge:': 'ટોકન ફી:',
  'confirm booking & pay': 'બુકિંગ કન્ફર્મ કરો અને ચૂકવો',
  'settings & wallet': 'સેટિંગ્સ અને પાકીટ',
  'patient booking': 'નવું બુકિંગ',
  'wallet balance': 'પાકીટ બેલેન્સ',
  'instant recharge wallet': 'પાકીટ રિચાર્જ કરો',
  'recharge': 'રિચાર્જ',
  'dealer / agent profile': 'ડીલર / એજન્ટ પ્રોફાઇલ',
  'dealer name': 'ડીલરનું નામ',
  'assigned village': 'ફાળવેલ ગામ',
  'registered phone': 'નોંધાયેલ મોબાઈલ',
  'dealer unique code': 'એજન્ટ કોડ',
  'save profile': 'પ્રોફાઇલ સાચવો',
  'transaction ledger': 'વ્યવહાર ખાતાવહી',
  'logout': 'લોગઆઉટ',
  'switch role': 'ભૂમિકા બદલો',
  'simulate doctor session': 'ડોક્ટર લોગિન ટેસ્ટ',
  'in queue': 'લાઈનમાં',
  'completed': 'પૂર્ણ કરેલ',
  'token fees': 'ટોકન ફી',
  'planned consultations': 'નિયોજિત પરામર્શ',
  'token id': 'ટોકન આઈડી',
  'slot': 'સમય ગાળો',
  'complete consultation': 'પરામર્શ પૂર્ણ કરો',
  'active hospital location': 'હોસ્પિટલ સેન્ટર',
  'active doctors': 'સક્રિય ડોક્ટરો',
  'total bookings': 'કુલ બુકિંગ',
  'hospital roster': 'ડોક્ટર રોસ્ટર',
  'add doctor': 'નવા ડોક્ટર ઉમેરો',
  'on leave': 'રજા પર',
  'active': 'સક્રિય',
  'edit': 'બદલો',
  'cancel': 'રદ કરો',
  'save doctor': 'ડોક્ટર સાચવો'
};

export const AppProvider = ({ children }) => {
  const [isApiMode, setIsApiMode] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'gu'
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_user');
    return saved ? JSON.parse(saved) : null; // { name, code, role, village, phone }
  });

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

  const [allAgents, setAllAgents] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_all_agents');
    return saved ? JSON.parse(saved) : initialAllAgents;
  });

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('dear_doctor_appointments');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state dynamically with Hostinger MySQL backend if present
  const refreshApiData = () => {
    const code = currentUser?.role === 'agent' ? currentUser.code : 'AGT-799';
    fetch(`./api.php?action=get_data&agent_code=${code}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success) {
          setHospitals(data.hospitals);
          setAgentWallet({ balance: data.wallet_balance, transactions: data.transactions });
          setAllAgents(data.all_agents);
          if (data.agent_profile) {
            setAgentProfile(data.agent_profile);
          }
          setAppointments(data.appointments);
          setIsApiMode(true);
        }
      })
      .catch(() => {
        setIsApiMode(false);
      });
  };

  useEffect(() => {
    refreshApiData();
  }, [currentUser]);

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
      localStorage.setItem('dear_doctor_all_agents', JSON.stringify(allAgents));
    }
  }, [allAgents, isApiMode]);

  useEffect(() => {
    if (!isApiMode) {
      localStorage.setItem('dear_doctor_appointments', JSON.stringify(appointments));
    }
  }, [appointments, isApiMode]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dear_doctor_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('dear_doctor_user');
    }
  }, [currentUser]);

  // Gujarati translation translator helper
  const t = (key) => {
    if (language === 'en') return key;
    const lowerKey = key.toLowerCase().trim();
    return guTranslations[lowerKey] || key;
  };

  const loginUser = (username, password) => {
    if (isApiMode) {
      return fetch('./api.php?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUser({
            name: data.user.name,
            code: data.user.code,
            role: data.role,
            village: data.user.village || '',
            phone: data.user.phone || ''
          });
          return { success: true };
        } else {
          return { success: false, message: data.message };
        }
      })
      .catch(() => {
        return { success: false, message: 'Server connection failed' };
      });
    }

    // LocalStorage simulation authentication
    if (username === 'superadmin' && password === 'superadmin') {
      setCurrentUser({ name: 'Superadmin Desk', code: 'SUPERADMIN', role: 'superadmin' });
      return Promise.resolve({ success: true });
    }
    if (username === 'admin' && password === 'admin') {
      setCurrentUser({ name: 'Hospital Admin', code: 'ADMIN', role: 'admin' });
      return Promise.resolve({ success: true });
    }
    if (username === 'doctor' && password === 'doctor') {
      setCurrentUser({ name: 'Dr. Kirit Patel', code: 'doc-1', role: 'doctor' });
      return Promise.resolve({ success: true });
    }

    const matchedAgent = allAgents.find((a) => a.code === username || a.phone === username);
    if (matchedAgent && password === 'agent') {
      if (matchedAgent.status === 'pending') {
        return Promise.resolve({ success: false, message: 'Agent account registration is pending Superadmin approval.' });
      }
      setCurrentUser({
        name: matchedAgent.name,
        code: matchedAgent.code,
        role: 'agent',
        village: matchedAgent.village,
        phone: matchedAgent.phone
      });
      return Promise.resolve({ success: true });
    }

    return Promise.resolve({ success: false, message: 'Invalid username or password' });
  };

  const registerAgent = (name, phone, village, password) => {
    if (isApiMode) {
      return fetch('./api.php?action=register_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, village, password })
      })
      .then((res) => res.json())
      .then((data) => {
        return { success: data.success, message: data.message };
      });
    }

    // LocalStorage simulation registration
    const code = 'AGT-' + (800 + allAgents.length);
    const newAgent = {
      id: Date.now(),
      name,
      village,
      phone,
      code,
      password,
      status: 'pending',
      wallet_balance: 0
    };

    setAllAgents((prev) => [...prev, newAgent]);
    return Promise.resolve({
      success: true,
      message: `Registration submitted. Your Code is ${code}. Please wait for Superadmin activation.`
    });
  };

  const approveAgent = (agentId) => {
    if (isApiMode) {
      fetch('./api.php?action=approve_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) refreshApiData();
      });
      return;
    }

    // Local state
    setAllAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          // Log transactions
          const newTx = {
            id: `tx-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'credit',
            amount: 525,
            details: `Activation Welcome Credit for Agent ${a.name}`
          };
          setAgentWallet((prevW) => ({
            balance: prevW.balance + 525,
            transactions: [newTx, ...prevW.transactions]
          }));

          return { ...a, status: 'approved', wallet_balance: 525 };
        }
        return a;
      })
    );
  };

  const rejectAgent = (agentId) => {
    if (isApiMode) {
      fetch('./api.php?action=reject_agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) refreshApiData();
      });
      return;
    }

    setAllAgents((prev) => prev.filter((a) => a.id !== agentId));
  };

  const logoutUser = () => {
    setCurrentUser(null);
  };

  const rechargeWallet = (amount) => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) return false;

    if (isApiMode) {
      const code = currentUser?.code || 'AGT-799';
      fetch(`./api.php?action=recharge&agent_code=${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: numAmount })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          refreshApiData();
        } else {
          alert('Recharge failed: ' + data.message);
        }
      });
      return true;
    }

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

  const bookAppointment = (patientName, patientPhone, patientAge, patientGender, problemDescription, hospitalId, doctorId, dateStr, timeSlot, useWalletPayment) => {
    const hospital = hospitals.find((h) => h.id === hospitalId);
    const doctor = hospital?.doctors.find((d) => d.id === doctorId);

    if (!hospital || !doctor) return { success: false, message: 'Invalid hospital or doctor selected' };

    const currentBookedCount = getBookedSlotsCount(doctorId, dateStr);
    if (currentBookedCount >= doctor.slotsPerDay) {
      return { success: false, message: 'Doctor is fully booked for this day' };
    }

    const bookingDate = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const bookingDay = days[bookingDate.getDay()];
    if (!doctor.weeklyDays.includes(bookingDay)) {
      return { success: false, message: `Doctor is only available on: ${doctor.weeklyDays.join(', ')}` };
    }

    if (isApiMode) {
      const code = currentUser?.code || 'AGT-799';
      fetch(`./api.php?action=book&agent_code=${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName,
          patientPhone,
          patientAge: parseInt(patientAge, 10),
          patientGender,
          problemDescription,
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
          setAppointments(prev => [data.appointment, ...prev]);
        } else {
          alert('Booking failed: ' + data.message);
        }
      });

      return { 
        success: true, 
        appointment: {
          id: `TK-SYNCING`,
          patientName,
          patientPhone,
          patientAge,
          patientGender,
          problemDescription,
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

    // Local simulation
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
      patientGender,
      problemDescription,
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
      const code = currentUser?.code || 'AGT-799';
      fetch(`./api.php?action=cancel&agent_code=${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) refreshApiData();
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
        if (data.success) refreshApiData();
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
        if (data.success) refreshApiData();
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
        if (data.success) refreshApiData();
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
    editDoctor(hospitalId, doctorId, { isActive: false });
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
      const code = currentUser?.code || 'AGT-799';
      fetch(`./api.php?action=profile_update&agent_code=${code}`, {
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
        if (data.success) refreshApiData();
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
        allAgents,
        appointments,
        currentUser,
        language,
        setLanguage,
        isApiMode,
        t,
        loginUser,
        registerAgent,
        approveAgent,
        rejectAgent,
        logoutUser,
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
