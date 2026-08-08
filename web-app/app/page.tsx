'use client';

import HoraCard from '@/components/hora-card';
import HoraTable from '@/components/hora-table';
import LanguageSwitcher from '@/components/language-switcher';
import { useState, useEffect } from 'react';
import { getCurrentHora } from '@/lib/hora-detector';
import { Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [horaData, setHoraData] = useState<any>(null);

  useEffect(() => {
    // Fetch current hora data using existing function
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      try {
        const data = await getCurrentHora(lat, lng);
        setHoraData(data);
      } catch (err) {
        console.error('Failed to fetch hora data:', err);
      }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with title and language switcher */}
      <div className="border-b border-[#ECD8B6] bg-[#FFF8EA]">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#281B10]">Horashtak</h1>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Original Hora Components */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {horaData && (
          <HoraCard horaData={{
            time: horaData.time,
            day: horaData.day,
            hora: horaData.hora,
            endTime: horaData.endTime
          }} />
        )}
        <HoraTable />
      </div>

      {/* Download App Button */}
      {/* <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex justify-center">
          <Link href="/download">
            <Button className="h-14 text-lg bg-blue-600 hover:bg-blue-700" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Download App
            </Button>
          </Link>
        </div>
      </div> */}
    </div>
  );
}
