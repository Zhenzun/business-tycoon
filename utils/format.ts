export const formatCurrency = (num: number): string => {
  if (num < 1000) return Math.floor(num).toString();

  // 1. Standar Suffix Biasa
  const standardSuffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  
  // 2. Hitung Suffix Index (Kelipatan 1000)
  // Menggunakan Math.log10 untuk menangani angka sangat besar dengan lebih aman
  const suffixNum = Math.floor(Math.log10(num) / 3);

  // 3. Ambil short value
  const shortValue = num / Math.pow(1000, suffixNum);
  const formattedValue = shortValue.toPrecision(3);

  // A. Jika masih dalam range standar (sampai Decillion)
  if (suffixNum < standardSuffixes.length) {
    return formattedValue + standardSuffixes[suffixNum];
  }

  // B. Professional Idle Game Notation (aa, ab, ac, ..., az, ba, bb...)
  // Logic: Setelah index 11 (Dc), kita mulai generate huruf.
  const alphabetOffset = suffixNum - standardSuffixes.length;
  
  const char1 = String.fromCharCode(97 + Math.floor(alphabetOffset / 26)); // a, b, c...
  const char2 = String.fromCharCode(97 + (alphabetOffset % 26)); // a...z
  
  return formattedValue + char1 + char2;
};