
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import SubNavigation from '@/components/layout/SubNavigation';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';

const Notifications = () => {
  return (
    <>
      <Navbar />
      <SubNavigation />
      <div className="p-4 md:p-6 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl font-futuraLight tracking-wide text-loro-navy">Notifications</h1>
          </div>
          
          <Card className="text-center py-10 md:py-14 bg-white border border-loro-pearl/20 shadow-luxury">
            <Bell className="mx-auto h-10 w-10 md:h-14 md:w-14 text-loro-sand mb-3 md:mb-4 opacity-70" />
            <p className="text-loro-navy/70 font-futuraLight">La fonctionnalité de notifications a été désactivée</p>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Notifications;
