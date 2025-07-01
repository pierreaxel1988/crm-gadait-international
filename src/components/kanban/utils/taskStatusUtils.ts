
import { isPast, isToday as isDateToday } from 'date-fns';

export const getTaskStatus = (nextFollowUpDate?: string) => {
  if (!nextFollowUpDate) {
    return {
      isOverdue: false,
      isTaskToday: false,
      isFutureTask: false,
      hasScheduledAction: false
    };
  }

  const followUpDateTime = new Date(nextFollowUpDate);
  const isOverdue = isPast(followUpDateTime) && !isDateToday(followUpDateTime);
  const isTaskToday = isDateToday(followUpDateTime);
  const isFutureTask = !isPast(followUpDateTime) && !isDateToday(followUpDateTime);

  return {
    isOverdue,
    isTaskToday,
    isFutureTask,
    hasScheduledAction: true
  };
};
