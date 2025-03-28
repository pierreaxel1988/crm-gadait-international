
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { CalendarProvider } from '@/contexts/CalendarContext';
import CalendarPageContent from '@/components/calendar/CalendarPageContent';
import { useIsMobile } from '@/hooks/use-mobile';

const Calendar = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <SubNavigation />
      <main className="p-3 md:p-6 bg-white min-h-screen">
        <CalendarProvider>
          <CalendarPageContent />
        </CalendarProvider>
      </main>
    </div>
  );
};

export default Calendar;
