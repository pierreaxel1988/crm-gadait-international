
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { CalendarProvider } from '@/contexts/CalendarContext';
import CalendarPageContent from '@/components/calendar/CalendarPageContent';

const Calendar = () => {
  return (
    <div className="flex min-h-screen flex-col bg-loro-white">
      <Navbar />
      <SubNavigation />
      <main className="flex-1 pb-12">
        <CalendarProvider>
          <CalendarPageContent />
        </CalendarProvider>
      </main>
    </div>
  );
};

export default Calendar;
