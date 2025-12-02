// Gunakan Victory Native atau Chart sederhana
// Logic fluktuasi harga:
useEffect(() => {
  const interval = setInterval(() => {
    setStockPrice(prev => {
      const change = (Math.random() - 0.5) * 10; // Naik/Turun max $5
      return Math.max(1, prev + change);
    });
  }, 3000);
  return () => clearInterval(interval);
}, []);